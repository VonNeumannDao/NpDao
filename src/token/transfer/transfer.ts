import {balance_of, set_account_balance} from '../account';
import {ic} from 'azle';
import {state} from '../state';
import {Account, IcrcTransaction, IcrcTransferArgs, IcrcTransferResult} from '../types';
import {uint8ToString} from "../utils";
import {putTransaction} from "./putTransaction";

export function handle_transfer(args: IcrcTransferArgs, from: Account): IcrcTransferResult {
    const fee = args.fee ?? state.fee;
    const balanceOfFrom = balance_of(from);
    if (balanceOfFrom < args.amount + fee) {
        ic.trap(`insufficient funds ${balanceOfFrom}  ${args.amount + fee}`);
    }

    set_account_balance(from, balance_of(from) - args.amount - fee);
    set_account_balance(args.to, balance_of(args.to) + args.amount);

    if (state.minting_account !== null) {
        set_account_balance(
            state.minting_account,
            balance_of(state.minting_account) + fee
        );
    }

    state.total_supply -= fee;

    console.log("transfered with memo: ", args.memo && uint8ToString(args.memo));

    const transaction: IcrcTransaction = {
        kind: "Transfer",
        burn: null,
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
