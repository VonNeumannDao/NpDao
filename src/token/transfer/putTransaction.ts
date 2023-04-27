import {state} from "../state";
import {IcrcTransaction} from "../types";
export function putTransaction(transaction: IcrcTransaction) {
    state.transactions.push(transaction);
}