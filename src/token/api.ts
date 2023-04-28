import {balance_of} from './account';
import {$query, nat, nat8, Opt, Vec, $update, Principal} from 'azle';
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

$update;
export async function total_transactions(): Promise<nat> {
    const len = await archiveCanister().length().call();
    console.log("we moved passed canister");
    console.log(len.Err);
    const archivedLen = (len && len.Ok) || 0n;

    console.log("we got passed archived length " + archivedLen);
    return BigInt(state.transactions.length) + archivedLen + BigInt(state.transactions.temporaryArchive.size());
}

$update
export async function get_transaction(tx_index: nat): Promise<Opt<TransactionWithId>> {
    if (tx_index > MAX_TRANSACTIONS_PER_REQUEST) {
        const arch = await archiveCanister().get_transaction(tx_index).call();
        if (arch && "Ok" in arch && arch.Ok) {
            // @ts-ignore
            return arch.Ok;
        }
    }

    return state.transactions.get(Number(tx_index));
}

$update;
export async function get_transactions(
    getTransactionsRequest: GetTransactionsRequest
): Promise<GetTransactionsResponse> {
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

    if (end > MAX_TRANSACTIONS_PER_REQUEST) {
        const logLength = await total_transactions();

        if (end > logLength) {
            end = logLength;
        }
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
