import {balance_of, set_account_balance} from '../account';
import {ic} from 'azle';
import {state} from '../state';
import {Account, IcrcTransaction, IcrcTransferArgs, IcrcTransferResult} from '../types';
import {putTransaction} from "./putTransaction";

export function handle_burn(args: IcrcTransferArgs, from: Account): IcrcTransferResult {
    set_account_balance(from, balance_of(from) - args.amount);
    state.total_supply -= args.amount;

    const transaction: IcrcTransaction = {
        kind: "Burn",
        burn: {
            amount: args.amount,
            memo: args.memo,
            created_at_time: null,
            from: {
                subaccount: args.from_subaccount,
                owner: ic.caller()
            }
        },
        mint: null,
        transfer: {
            from: from,
            to: args.to,
            amount: args.amount,
            fee: args.fee,
            memo: args.memo,
            created_at_time: ic.time()
        },
        timestamp: ic.time()
    };

    return {
        Ok: putTransaction(transaction)
    };
}
