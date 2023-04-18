import {ic, Opt, $init, $preUpgrade, $postUpgrade, StableBTreeMap, Vec, Principal, nat64} from 'azle';
import { state } from './state';
import { handle_mint } from './transfer/mint';
import { is_subaccount_valid, stringify } from './transfer/validate';

import {
    Account, AccountsRecord,
    InitialAccountBalance, Vote, SerializableProposal, Transaction,
    TransferArgs, Proposal
} from './types';
import {DAO_TREASURY, MINTING_ACCOUNT} from "./constants";

let stableAccounts = new StableBTreeMap<string, AccountsRecord>(0, 100, 200);
let stableTransactions = new StableBTreeMap<string, Transaction>(1, 100, 500);
let stableProposals= new StableBTreeMap<string, SerializableProposal>(2, 100, 500);
let stableProposalVotes = new StableBTreeMap<string, Vec<Vote>>(3, 100, 200);

$preUpgrade;
export function preUpgrade(): void {
    for (let ownerKey in state.accounts) {
        for (let accountKey in state.accounts?.[ownerKey]) {
            // @ts-ignore
            const balance: bigint = state.accounts?.[ownerKey]?.[accountKey];
            stableAccounts.insert(ownerKey + accountKey, {
                ownerKey: ownerKey,
                accountKey: accountKey,
                balance: balance
            });
        }
    }

    for (let transaction of state.transactions) {
        stableTransactions.insert(transaction.timestamp.toString(10), transaction);
    }
    for (let proposal of state.proposals.values()) {
        const votesToSave = Object.values(proposal.votes);
        stableProposalVotes.insert(proposal.id.toString(10), votesToSave);
        // @ts-ignore
        delete proposal.votes;
        stableProposals.insert(proposal.id.toString(10), proposal);
    }
}

$postUpgrade;
export function postUpgrade(): void {
    for (let accounts of stableAccounts.values()) {
        // @ts-ignore
        state.accounts[accounts.ownerKey] = {};
        // @ts-ignore
        state.accounts[accounts.ownerKey][accounts.accountKey] = accounts.balance;
    }

    for (let transaction of stableTransactions.values()) {
        state.transactions.push(transaction);
    }

    for (let value of stableProposals.values()) {
            const votes = stableProposalVotes.get(value.id.toString(10));
            const proposal = {
                ...value,
                votes: {}
            }

        for (let votesKey in votes) {
            const votesToUse = votesKey as any as Vote;
            // @ts-ignore
            proposal.votes[votesToUse.voter.toText()] = {
                voter: votesToUse.voter,
                voteYes: votesToUse.voteYes,
                voteNo: votesToUse.voteNo
            }
        }
            state.proposals.set(value.id, proposal);
    }
}

$init;
export function init(): void {
    console.log('this runs the init', state.initial_supply);
    state.minting_account = validate_minting_account(MINTING_ACCOUNT);
    initialize_account_balance({
        account: DAO_TREASURY,
        balance: state.initial_supply
    });
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

    const args: TransferArgs = {
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
