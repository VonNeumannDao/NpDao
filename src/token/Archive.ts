import {TransactionWithId} from "./types";
import {state} from "./state";
import {archiveCanister, Queue} from "./utils";
import {ic} from 'azle';
export async function _refreshArchivedTotalTransactions(): Promise<void> {
    const len = await archiveCanister(ic.id().toText()).length().call();
    state.cachedArchiveTotal = (len && len.Ok) || 0n;
}
export async function _loadTransactions(): Promise<void> {
    console.log("Loading transactions");
    const transactions: Queue<TransactionWithId> = state.transactions.temporaryArchive;
    let numberLoaded = 0;
    const transactionsToTransfer = [];
    while (!transactions.isEmpty()) {
        const transaction = transactions.dequeue();
        if (transaction) {
            transactionsToTransfer.push(transaction);
            numberLoaded++;
        }
    }
    const response = await archiveCanister(ic.id().toText()).archive(transactionsToTransfer).call();
    // @ts-ignore
    if ("Ok" in response && "Ok" in response.Ok) {
        console.log(`Loaded ${numberLoaded} transactions`);
        await _refreshArchivedTotalTransactions();
    } else {
        console.log("Failed to load transactions");
        state.transactions.temporaryArchive.items.push(...transactionsToTransfer);
    }
}




