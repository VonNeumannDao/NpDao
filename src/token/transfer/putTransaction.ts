import {state} from "../state";
import {IcrcTransaction} from "../types";
import {nat} from "azle";
export function putTransaction(transaction: IcrcTransaction): nat {
    const transactionsArray = state.transactions;
    const lastElement = transactionsArray.slice(-1)[0];
    const id = lastElement ? lastElement.id + 1n : 0n;
    transactionsArray.push({
        transaction,
        id
    });

    return id;
}