import {$init, $postUpgrade, $preUpgrade, ic, Opt} from 'azle';
import {state} from './state';
import {handle_mint} from './transfer/mint';
import {is_subaccount_valid, stringify} from './transfer/validate';

import {Account, InitialAccountBalance, IcrcTransferArgs} from './types';
import {AIRDROP_ACCOUNT, DAO_TREASURY, MINTING_ACCOUNT, XTC_DISTRIBUTION_ACCOUNT} from "./constants";
import {
    stableAccounts,
    stableIds, stableMemory,
    stableProposals,
    stableStakingAccounts,
    stableTransactions
} from "./stable_memory";
import {startTimer} from "./dao";

$preUpgrade;

export function preUpgrade(): void {
    console.log(state.accounts)
    stableIds.insert("proposalCount", state.proposalCount.toString(10));
    stableIds.insert("totalSupply", state.total_supply.toString(10));
    if (state.drainCanister) {
        stableMemory.insert("drainCanister", state.drainCanister);
    }
    for (let ownerKey in state.accounts) {
        console.log(ownerKey);

        for (let accountKey in state.accounts?.[ownerKey]) {
            console.log(accountKey, ownerKey);
            const balance: bigint | undefined = state.accounts?.[ownerKey]?.[accountKey];
            stableAccounts.insert(ownerKey + accountKey, {
                ownerKey: ownerKey,
                accountKey: accountKey,
                balance: balance || 0n
            });
        }
    }
    console.log("starting transactions");

    for (let transaction of state.transactions) {
        stableTransactions.insert(transaction.timestamp.toString(10), transaction);
    }
    console.log("starting proposals");
    for (let [key, val] of state.proposals.entries()) {
        if(val.ended) {
            val.wasm = null;
            const votesToSave = Object.values(val.votes);
            console.log(val.id.toString(10));
            stableProposals.insert(val.id.toString(10), val);
        }
    }
    console.log("end proposals")

    console.log("starting staking accounts", state.stakingAccountsState);
    let index = 0;
    if (state.stakingAccountsState) {
        console.log("staking not null")
        Object.keys(state.stakingAccountsState).forEach((key) => {
            if (key) {
                // @ts-ignore
                state.stakingAccountsState[key].forEach((value) => {
                    stableStakingAccounts.insert(index, value);
                    index++;
                });
            }
        });
    }


    console.log("end staking accounts")
}

$postUpgrade;

export function postUpgrade(): void {
    state.minting_account = MINTING_ACCOUNT;
    state.proposalCount = BigInt(stableIds.get("proposalCount") || 0);
    state.total_supply = BigInt(stableIds.get("totalSupply") || 0);
    state.drainCanister = stableMemory.get("drainCanister");
    console.log("starting accounts")
    for (let accounts of stableAccounts.values()) {
        if (accounts != null && accounts.ownerKey != null && accounts.accountKey != null) {
            if (state.accounts[accounts.ownerKey] == null) {
                state.accounts[accounts.ownerKey] = {};
            }
            // @ts-ignore
            state.accounts[accounts.ownerKey][accounts.accountKey] = accounts.balance || 0n;
        }
    }
    console.log("starting transactions")
    for (let transaction of stableTransactions.values()) {
        state.transactions.push(transaction);
    }
    console.log("starting proposals")

    for (let value of stableProposals.values()) {
        const proposal = {
            ...value,
            votes: {}
        }

        if (value.voters) {
            value.voters.forEach(votesToUse => {
                // @ts-ignore
                proposal.votes[votesToUse.voter] = {
                    voter: votesToUse.voter,
                    voteYes: votesToUse.direction ? votesToUse.power : 0n,
                    voteNo: !votesToUse.direction ? votesToUse.power : 0n,
                }
            });
        }
        state.proposals.set(value.id, proposal);
    }

    if(!state.stakingAccountsState) {
        state.stakingAccountsState = {};
    }

    stableStakingAccounts.values().forEach((stakingAccount) => {
        if (stakingAccount.principal) {
            // @ts-ignore
            let stakingAccountsStateList = state.stakingAccountsState[stakingAccount.principal];
            if (!stakingAccountsStateList) {
                stakingAccountsStateList = [];
            }
            stakingAccountsStateList.push(stakingAccount);
            // @ts-ignore
            state.stakingAccountsState[stakingAccount.principal] = stakingAccountsStateList;
        }
    });

    startTimer();
}

$init;

export function init(): void {
    console.log('this runs the init', state.initial_supply);
    state.minting_account = validate_minting_account(MINTING_ACCOUNT);
    initialize_account_balance({
        account: DAO_TREASURY,
        balance: state.initial_supply
    });

    const transferArgs: IcrcTransferArgs = {
        amount: state.airdropAmount,
        created_at_time: null,
        fee: null,
        from_subaccount: null,
        memo: null,
        to: AIRDROP_ACCOUNT
    };
    const transferTokenDistribution: IcrcTransferArgs = {
        amount: state.xtcDistributionAmount,
        created_at_time: null,
        fee: null,
        from_subaccount: null,
        memo: null,
        to: XTC_DISTRIBUTION_ACCOUNT
    };
    handle_mint(transferArgs, MINTING_ACCOUNT);
    handle_mint(transferTokenDistribution, MINTING_ACCOUNT);

    startTimer();
}

function validate_minting_account(minting_account: Opt<Account>): Opt<Account> {
    if (
        minting_account !== null &&
        is_subaccount_valid(minting_account.subaccount) === false
    ) {
        ic.trap(`subaccount for minting account must be 32 bytes in length`);
    }

    return minting_account;
}

function initialize_account_balance(
    initial_account_balance: InitialAccountBalance
) {
    if (
        is_subaccount_valid(initial_account_balance.account.subaccount) ===
        false
    ) {
        ic.trap(
            `subaccount for initial account ${initial_account_balance.account.owner.toText()} must be 32 bytes in length`
        );
    }

    const args: IcrcTransferArgs = {
        amount: initial_account_balance.balance,
        created_at_time: ic.time(),
        fee: null,
        from_subaccount: null,
        memo: null,
        to: initial_account_balance.account
    };

    const mint_result = handle_mint(args, state.minting_account);

    if ('Err' in mint_result) {
        ic.trap(stringify(mint_result.Err));
    }
}
