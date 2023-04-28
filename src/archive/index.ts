import {$query, $update, ic, nat, nat32, StableBTreeMap, Variant, Vec} from "azle";
import {ArchiveResponse, GetTransactionsRequest, TransactionRange, TransactionWithId} from "../token/types";
import {MAX_TRANSACTIONS_PER_REQUEST} from "../token/constants";
export let archivedTransaction = new StableBTreeMap<string, TransactionWithId>(8, 100, 500);

$update;
export async function archive(transactions: Vec<TransactionWithId>): Promise<ArchiveResponse> {
    const caller = ic.caller();
    if (caller.toText() !== "4dybz-kiaaa-aaaap-qba4q-cai" || caller.toText() !== "r7inp-6aaaa-aaaaa-aaabq-cai") {
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

    return { Ok: 200 };
}

$query;
export function get_transactions(request: GetTransactionsRequest): TransactionRange {
    let {start, length} = request;
    const transactionLength = archivedTransaction.len();
    if (length > MAX_TRANSACTIONS_PER_REQUEST) {
        length = MAX_TRANSACTIONS_PER_REQUEST;
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
