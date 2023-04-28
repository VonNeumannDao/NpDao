import {TransactionWithId} from "./types";
import {stableArchivedTransactions} from "./stable_memory";
import {state} from "./state";
import {Queue} from "./utils";

export function _loadTransactions(): void {
    console.log("Loading transactions");
    const transactions: Queue<TransactionWithId> = state.transactions.temporaryArchive;
    let numberLoaded = 0;
    while (!transactions.isEmpty()) {
        const transaction = transactions.dequeue();
        if (transaction) {
            stableArchivedTransactions.insert(transaction.id.toString(10), transaction);
            numberLoaded++;
        }
    }
    console.log(`Loaded ${numberLoaded} transactions`);
}

