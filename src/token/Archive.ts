import {IcrcTransaction} from "./types";
import {stableArchivedTransactions} from "./stable_memory";
import {state} from "./state";
import {Queue} from "./utils";

export function _loadTransactions(): void {
    console.log("Loading transactions");
    const transactions: Queue<IcrcTransaction> = state.transactions.temporaryArchive;
    while (!transactions.isEmpty()) {
        const transaction = transactions.dequeue();
        if (transaction)
            stableArchivedTransactions.insert(stableArchivedTransactions.len().toString(10), transaction);
    }
    console.log(`Loaded ${stableArchivedTransactions.len().toString(10)} transactions`);
}

