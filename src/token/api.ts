import {balance_of} from './account';
import {$query, nat, nat64, nat8, Opt, Vec, ic} from 'azle';
import {state} from './state';
import {
    Account,
    Metadatum,
    SupportedStandard,
    IcrcTransaction,
    TransactionRange,
    GetTransactionsRequest,
    GetTransactionsResponse,
    ArchivedTransaction, QueryArchiveFn
} from './types';
import {stableArchivedTransactions} from "./stable_memory";
import {MAX_TRANSACTIONS_PER_REQUEST} from "./constants";

$query;
export function getQueryArchiveFn(): QueryArchiveFn {
    return [ic.id(), 'get_archived_transactions'];
}

$query;
export function total_transactions(): nat {
    return BigInt(state.transactions.length) + stableArchivedTransactions.len();
}

$query
export function get_transaction(tx_index: nat): Opt<IcrcTransaction> {
    if (tx_index > MAX_TRANSACTIONS_PER_REQUEST) {
        return stableArchivedTransactions.get(tx_index.toString(10));
    }

    return state.transactions.get(Number(tx_index));
}

$query;
export function get_archived_transactions(request: GetTransactionsRequest): TransactionRange {
    let {start, length} = request;
    const transactionLength = stableArchivedTransactions.len();
    if (length > MAX_TRANSACTIONS_PER_REQUEST) {
        length = MAX_TRANSACTIONS_PER_REQUEST;
    }

    if (length > transactionLength) {
        length = transactionLength;
    }

    let end = start + length;
    const transactions: IcrcTransaction[] = [];
    for (let i = start; i < end; i++) {
        const archived = stableArchivedTransactions.get(i.toString(10));
        if (archived !== null)
            transactions.push(archived);
    }

    return {transactions};
}

$query;
export function get_transactions(
    getTransactionsRequest: GetTransactionsRequest
): GetTransactionsResponse {
    let { start, length } = getTransactionsRequest;
    const transactionLength = BigInt(state.transactions.length);
    if (length > MAX_TRANSACTIONS_PER_REQUEST) {
        length = MAX_TRANSACTIONS_PER_REQUEST;
    }

    let end = start + length;
    if (end > transactionLength) {
        end = transactionLength;
    }

    let transactions = state.transactions.slice(
        Number(transactionLength - end),
        Number(transactionLength - start)
    ).reverse();

    let archivedEnd = start;
    let archivedStart = BigInt(archivedEnd - MAX_TRANSACTIONS_PER_REQUEST);
    if (archivedStart < 0) {
        archivedStart = BigInt(0);
    }

    let archivedTransactions: ArchivedTransaction[] = [];
    let endIdx = archivedStart - MAX_TRANSACTIONS_PER_REQUEST;
    while (endIdx >= archivedStart) {
        const archivedTransaction = {
            start: BigInt(endIdx),
            length: MAX_TRANSACTIONS_PER_REQUEST,
            callback: getQueryArchiveFn(),
        };
        archivedTransactions.push(archivedTransaction);
        archivedEnd -= MAX_TRANSACTIONS_PER_REQUEST;
        endIdx -= MAX_TRANSACTIONS_PER_REQUEST;
    }

    if (archivedStart < archivedEnd) {
        const archivedTransaction = {
            start: archivedStart,
            length: archivedEnd - archivedStart,
            callback: getQueryArchiveFn(),
        };
        archivedTransactions.push(archivedTransaction);
    }

    return {
        log_length: BigInt(state.transactions.length),
        first_index: start,
        transactions,
        archived_transactions: archivedTransactions,
    };
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
