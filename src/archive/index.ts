import {$init, $query, $update, ic, nat, Opt, StableBTreeMap, Vec} from "azle";
import {ArchiveResponse, GetTransactionsRequest, TransactionRange, TransactionWithId} from "../token/types";
import prodCanister from "../../canister_ids.json";

const prodCanisterIds = (env: string) => {
    if (env === "prod") {
        return [prodCanister.token.ic, prodCanister.archive.ic];
    } else  if (env === "stage") {
        return [prodCanister.token.staging, prodCanister.archive.staging];
    } else {
        return [];
    }
};
export let archivedTransaction = new StableBTreeMap<string, TransactionWithId>(9, 100, 400);

let env: "dev" | "prod" | "stage" = "dev";

$init;
export function init(): void {
    const canisterId = ic.id.toString();
    if (prodCanister.archive.ic === canisterId) {
        env = "prod";
    } else if (prodCanister.archive.staging === canisterId) {
        env = "stage";
    } else {
        env = "dev";
    }
}

$update;
export async function archive(transactions: Vec<TransactionWithId>): Promise<ArchiveResponse> {
    console.log("Archiving transactions");
    const caller = ic.caller();
    if (env !== "dev" && !prodCanisterIds(env).includes(caller.toString())) {
        console.log("Unauthorized " + env);
        return { Err: 401 };
    }

    transactions.forEach((transaction) => {
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
        if (archived !== null){
            transactions.push(archived);
            console.log(sizeof(archived));
        }
    }

    return {transactions: transactions.reverse()};
}

$query;
export function length(): nat {
    return archivedTransaction.len();
}

$query;
export function get_transaction(tx_index: nat): Opt<TransactionWithId> {
    return archivedTransaction.get(tx_index.toString(10));
}

function sizeof(object: any): number {
    const objectList = [];
    const stack = [object];
    let bytes = 0;

    while (stack.length) {
        const value = stack.pop();

        if (typeof value === 'boolean') {
            bytes += 4;
        } else if (typeof value === 'string') {
            bytes += value.length * 2;
        } else if (typeof value === 'number') {
            bytes += 8;
        } else if (typeof value === 'object' && objectList.indexOf(value) === -1) {
            objectList.push(value);

            for (const i in value) {
                stack.push(value[i]);
            }
        }
    }

    return bytes;
}
