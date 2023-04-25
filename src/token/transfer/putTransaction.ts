import {state} from "../state";
import {IcrcTransaction} from "../types";
import {stableArchivedTransactions} from "../stable_memory";
export function putTransaction(transaction: IcrcTransaction) {
    state.transactions.push(transaction);
    stableArchivedTransactions.insert(stableArchivedTransactions.len().toString(10), transaction);
}