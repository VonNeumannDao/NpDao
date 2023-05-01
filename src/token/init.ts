import {$init, $postUpgrade, $preUpgrade, ic, Opt, Vec} from 'azle';
import {state} from './state';
import {handle_mint} from './transfer/mint';
import {is_subaccount_valid} from './transfer/validate';
import prodCanister from "../../canister_ids.json";

import {
    Account,
    InitialAccountBalance,
    IcrcTransferArgs,
    TransactionWithId,
    AccountsRecord,
    StakingAccount, AirdropHolder
} from './types';
import {
    AIRDROP_ACCOUNT, DAO_TREASURY,
    MAX_TRANSACTIONS_PER_REQUEST,
    MINTING_ACCOUNT,
    XTC_DISTRIBUTION_ACCOUNT
} from "./constants";
import {
    stableAccounts, stableAirdropHolders,
    stableIds, stableMemory,
    stableProposals, stableQueuedTransactions,
    stableStakingAccounts,
    stableTransactions
} from "./stable_memory";
import {startTimer} from "./Timer";
import {CircularBuffer} from "./utils";

$preUpgrade;
export function preUpgrade(): void {
    stableIds.insert("proposalCount", state.proposalCount.toString(10));
    stableIds.insert("totalSupply", state.total_supply.toString(10));
    if (state.drainCanister) {
        stableMemory.insert("drainCanister", state.drainCanister);
    }
    const acnts: Vec<AccountsRecord> = [];
    for (let ownerKey in state.accounts) {

        for (let accountKey in state.accounts?.[ownerKey]) {
            const balance: bigint | undefined = state.accounts?.[ownerKey]?.[accountKey];
            acnts.push({
                ownerKey: ownerKey,
                accountKey: accountKey,
                balance: balance || 0n
            })
        }
    }
    stableAccounts.insert(0, acnts);


    for (let item of state.transactions.temporaryArchive.items) {
        stableQueuedTransactions.insert(item.id.toString(10), item);
    }
    const serializableTransactions = [...state.transactions];
    stableTransactions.insert(0, serializableTransactions);
    const srlzProposals = [];
    for (let [key, val] of state.proposals.entries()) {
        if(val.ended) {
            val.wasm = null;
            srlzProposals.push(val);
        }
    }
    stableProposals.insert(0, srlzProposals);

    const stakingAccounts: StakingAccount[] = [];
    if (state.stakingAccountsState) {
        Object.keys(state.stakingAccountsState).forEach((key) => {
            if (key) {
                // @ts-ignore
                state.stakingAccountsState[key].forEach((value) => {
                    stakingAccounts.push(value);
                });
            }
        });
    }
    stableStakingAccounts.insert(0, stakingAccounts);
    for (let [key, value] of state.airdrop_snapshot.holders) {
        stableAirdropHolders.insert(key, value);
    }
    stableIds.insert("airdropTotalSupply", state.airdrop_snapshot.totalSupply.toString(10));
    stableIds.insert("airdropDateTaken", state.airdrop_snapshot.dateTaken.toString(10));


}

$postUpgrade;
export function postUpgrade(): void {
    state.minting_account = MINTING_ACCOUNT;
    state.proposalCount = BigInt(stableIds.get("proposalCount") || 0);
    state.total_supply = BigInt(stableIds.get("totalSupply") || 0);
    state.drainCanister = stableMemory.get("drainCanister");
    const accountObj = stableAccounts.get(0);
    if (accountObj) {
        for (let accounts of accountObj) {
            if (accounts != null && accounts.ownerKey != null && accounts.accountKey != null) {
                if (state.accounts[accounts.ownerKey] == null) {
                    state.accounts[accounts.ownerKey] = {};
                }
                // @ts-ignore
                state.accounts[accounts.ownerKey][accounts.accountKey] = accounts.balance || 0n;
            }
        }
    }

    for (let i = 0n; i< stableQueuedTransactions.len(); i++) {
        const transaction = stableQueuedTransactions.get(i.toString(10));
        if (transaction)
        state.transactions.temporaryArchive.items.push(transaction);
    }

    const trx = stableTransactions.get(0) || [];
    state.transactions = new CircularBuffer<TransactionWithId>(Number(MAX_TRANSACTIONS_PER_REQUEST), trx)

    const votes = stableProposals.get(0) || [];
    for (let value of votes) {
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
    const stakingAccounts = stableStakingAccounts.get(0) || [];
    stakingAccounts.forEach((stakingAccount) => {
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

    const holderMap = new Map<string, AirdropHolder>();
    for (let item of stableAirdropHolders.items()) {
        holderMap.set(item[0], item[1]);
    }

    state.airdrop_snapshot = {
        holders: holderMap,
        totalSupply: BigInt(stableIds.get("airdropTotalSupply") || 0),
        dateTaken: BigInt(stableIds.get("airdropDateTaken") || 0)
    }

    startTimer();
}

$init;
export function init(): void {
    console.log('this runs the init', state.initial_supply);
    if (prodCanister.token.ic === ic.id().toText()) {
        state.isDev = false;
    }

    state.minting_account = validate_minting_account(MINTING_ACCOUNT);
    initialize_account_balance({
        account: DAO_TREASURY,
        balance: state.initial_supply
    });
    console.log("initial supply");

    const transferArgs: IcrcTransferArgs = {
        amount: state.airdropAmount,
        created_at_time: null,
        fee: null,
        from_subaccount: MINTING_ACCOUNT.subaccount,
        memo: null,
        to: AIRDROP_ACCOUNT
    };
    const transferTokenDistribution: IcrcTransferArgs = {
        amount: state.xtcDistributionAmount,
        created_at_time: null,
        fee: null,
        from_subaccount: MINTING_ACCOUNT.subaccount,
        memo: null,
        to: XTC_DISTRIBUTION_ACCOUNT
    };
    handle_mint(transferArgs, MINTING_ACCOUNT);
    console.log("airdrop amount");

    handle_mint(transferTokenDistribution, MINTING_ACCOUNT);
    console.log("xtc distribution amount");
    startTimer();
}

function validate_minting_account(minting_account: Opt<Account>): Opt<Account> {
    if (
        minting_account !== null &&
        !is_subaccount_valid(minting_account.subaccount)
    ) {
        ic.trap(`subaccount for minting account must be 32 bytes in length`);
    }

    return minting_account;
}

function initialize_account_balance(
    initial_account_balance: InitialAccountBalance
) {
    if (
        !is_subaccount_valid(initial_account_balance.account.subaccount)
    ) {
        ic.trap(
            `subaccount for initial account ${initial_account_balance.account.owner.toText()} must be 32 bytes in length`
        );
    }

    const args: IcrcTransferArgs = {
        amount: initial_account_balance.balance,
        created_at_time: ic.time(),
        fee: null,
        from_subaccount: MINTING_ACCOUNT.subaccount,
        memo: null,
        to: initial_account_balance.account
    };

    handle_mint(args, state.minting_account);
}
