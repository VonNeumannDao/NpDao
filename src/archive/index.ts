import {$init, $query, $update, ic, nat, Opt, StableBTreeMap, Vec} from "azle";
import {ArchiveResponse, GetTransactionsRequest, TransactionRange, TransactionWithId} from "../token/types";
import prodCanister from "../../canister_ids.json";

const prodCanisterIds = [prodCanister.token.ic, prodCanister.archive.ic];
export let archivedTransaction = new StableBTreeMap<string, TransactionWithId>(9, 100, 500);

let isDev = true;

$init;
export function init(): void {
    if (prodCanister.archive.ic === ic.id.toString()) {
        isDev = false;
    }
}

$update;
export async function archive(transactions: Vec<TransactionWithId>): Promise<ArchiveResponse> {
    console.log("Archiving transactions");
    const caller = ic.caller();
    if (!isDev && !prodCanisterIds.includes(caller.toString())) {
        console.log("Unauthorized " + isDev.toString());
        return { Err: 401 };
    }
    transactions.sort((tranA, tranB) => {
        const a = tranA.id;
        const b = tranB.id;
        if(a > b) {
            return 1;
        } else if (a < b){
            return -1;
        } else {
            return 0;
        }
    }).forEach((transaction) => {
        archivedTransaction.insert(transaction.id.toString(), transaction);
    });

    console.log("Archived transactions " + archivedTransaction.len().toString());

    return { Ok: 200 };
}

$query;
export function get_transactions(request: GetTransactionsRequest): TransactionRange {
    let {start, length} = request;
    const transactionLength = archivedTransaction.len();
    if (length > 1000n) {
        length = 1000n;
    }

    if (length > transactionLength) {
        length = transactionLength;
    }

    let end = start + length;
    const transactions: TransactionWithId[] = [];
    for (let i = start; i < end; i++) {
        const archived = archivedTransaction.get(i.toString(10));
        if (archived !== null)
            transactions.push(archived);
    }

    return {transactions};
}

$query;
export function length(): nat {
    return archivedTransaction.len();
}

$query;
export function get_transaction(tx_index: nat): Opt<TransactionWithId> {
    return archivedTransaction.get(tx_index.toString(10));
}
