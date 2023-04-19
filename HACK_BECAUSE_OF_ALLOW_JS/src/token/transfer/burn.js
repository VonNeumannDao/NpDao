import { balance_of, set_account_balance } from '../account';
import { ic } from 'azle';
import { state } from '../state';
export function handle_burn(args, from) {
    set_account_balance(from, balance_of(from) - args.amount);
    state.total_supply -= args.amount;
    const transaction = {
        args,
        fee: 0n,
        from,
        kind: {
            Burn: null
        },
        timestamp: ic.time()
    };
    state.transactions.push(transaction);
    const transfer_result = {
        Ok: args.amount
    };
    return transfer_result;
}
