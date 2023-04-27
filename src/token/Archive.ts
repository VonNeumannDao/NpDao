import {IcrcTransaction} from "./types";
import {stableArchivedTransactions} from "./stable_memory";
import {state} from "./state";
import {CircularBuffer} from "./utils";

export function _loadTransactions(): void {
    console.log("Loading transactions");
    const transactions: CircularBuffer<IcrcTransaction> = state.transactions;
    for (const transaction of transactions) {
        const timestampStr = transaction.timestamp.toString();
        // Check if the transaction already exists in the map
        if (stableArchivedTransactions.containsKey(timestampStr)) {
            console.log(`Skipping duplicate transaction at timestamp ${timestampStr}`);
            continue;
        }
        stableArchivedTransactions.insert(timestampStr, transaction);
    }
    console.log(`Loaded ${transactions.length} transactions`);
    return;
}
