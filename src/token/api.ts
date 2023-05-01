import {balance_of} from './account';
import {$query, nat, nat8, Opt, Vec, $update, Principal, ic} from 'azle';
import {state} from './state';
import {
    Account,
    Metadatum,
    SupportedStandard,
    TransactionRange,
    GetTransactionsRequest,
    GetTransactionsResponse,
    ArchivedTransaction, QueryArchiveFn, TransactionWithId
} from './types';
import {MAX_TRANSACTIONS_PER_REQUEST} from "./constants";
import devCanister from "../../.dfx/local/canister_ids.json";
import prodCanister from "../../canister_ids.json";
import {archiveCanister} from "./utils";

$query;
export function getQueryArchiveFn(): QueryArchiveFn {
    return [Principal.fromText(state.isDev ? devCanister.archive.local : prodCanister.archive.ic), 'get_transactions'];
}
$update
export async function total_transactions_debug(): Promise<string> {
    const len = await archiveCanister(ic.id().toText()).length().call();
    const archivedLen = (len && len.Ok) || 0n;
    if ("Err" in len) {
        return "Err: " + len.Err;
    }
    return state.isDev + " ArchivedTransactions: " + archivedLen + " transactions: " + state.transactions.length;
}

$query;
export function total_transactions(): nat {
    return state.cachedArchiveTotal + BigInt(state.transactions.temporaryArchive.size());
}

$update
export async function get_transaction(tx_index: nat): Promise<Opt<TransactionWithId>> {
    const activeTransaction = state.transactions.get(Number(tx_index));

    if (activeTransaction) {
        return activeTransaction;
    }

    const arch = await archiveCanister(ic.id().toText()).get_transaction(tx_index).call();
    if (arch && "Ok" in arch && arch.Ok) {
        // @ts-ignore
        return arch.Ok;
    }

    return null;
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

    const archivedTransactions: ArchivedTransaction[] = [];
    let newEnd = start + length;
    if (newEnd > MAX_TRANSACTIONS_PER_REQUEST) {
        const logLength = total_transactions();
        archivedTransactions.push({
            start,
            length: logLength,
            callback: getQueryArchiveFn()
        });
    }

    return {
        log_length: BigInt(state.transactions.length),
        first_index: start,
        transactions,
        archived_transactions: archivedTransactions
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
