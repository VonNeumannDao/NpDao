import {balance_of} from './account';
import {$query, nat, nat64, nat8, Opt, Vec} from 'azle';
import {state} from './state';
import {Account, Metadatum, SupportedStandard, IcrcTransaction, GetTransactionsRequest, GetTransactionsResponse} from './types';
const MAX_TRANSACTIONS_PER_REQUEST = 5000n;
$query;

export function get_transactions(
getTransactionsRequest: GetTransactionsRequest
): GetTransactionsResponse {
    let {start, length} = getTransactionsRequest;
    const transactionLength = BigInt(state.transactions.length);
    if (length > MAX_TRANSACTIONS_PER_REQUEST) {
        length = MAX_TRANSACTIONS_PER_REQUEST;
    }

    let end = start + length;
    if (end > transactionLength) {
        end = transactionLength;
    }


    const transactions =  state.transactions.slice(Number(start), Number(end));
    return {
        log_length: BigInt(transactions.length),
        first_index: start,
        transactions,
        archived_transactions: []
    }
}

$query;

export function icrc1_balance_of(account: Account): nat {
    return balance_of(account);
}

$query;

export function icrc1_decimals(): nat8 {
    return state.decimals;
}

$query;

export function icrc1_fee(): nat {
    return state.fee;
}

$query;

export function icrc1_metadata(): Vec<Metadatum> {
    return state.metadata;
}

$query;

export function icrc1_minting_account(): Opt<Account> {
    return state.minting_account;
}

$query;

export function icrc1_name(): string {
    return state.name;
}

$query;

export function icrc1_supported_standards(): Vec<SupportedStandard> {
    return state.supported_standards;
}

$query;

export function icrc1_symbol(): string {
    return state.symbol;
}

$query;

export function icrc1_total_supply(): nat {
    return state.total_supply;
}

export {icrc1_transfer, mint_tokens} from './transfer';
