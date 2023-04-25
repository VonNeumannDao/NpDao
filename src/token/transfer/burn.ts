import {balance_of, set_account_balance} from '../account';
import {ic} from 'azle';
import {state} from '../state';
import {
    Account,
    IcrcTransaction,
    IcrcTransferArgs,
    IcrcTransferResult
} from '../types';
import {putTransaction} from "./putTransaction";

export function handle_burn(args: IcrcTransferArgs, from: Account): IcrcTransferResult {
    set_account_balance(from, balance_of(from) - args.amount);
    state.total_supply -= args.amount;

    const transaction: IcrcTransaction = {
        args,
        fee: 0n,
        from,
        kind: {
            Burn: null
        },
        timestamp: ic.time()
    };

    putTransaction(transaction);

    const transfer_result: IcrcTransferResult = {
        Ok: args.amount
    };

    return transfer_result;
}
