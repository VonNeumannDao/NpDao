import { balance_of, set_account_balance } from '../account';
import { ic } from 'azle';
import { state } from '../state';
export function handle_mint(args, from) {
    set_account_balance(args.to, balance_of(args.to) + args.amount);
    state.total_supply += args.amount;
    const transaction = {
        args,
        fee: 0n,
        from,
        kind: {
            Mint: null
        },
        timestamp: ic.time()
    };
    state.transactions.push(transaction);
    const transfer_result = {
        Ok: args.amount
    };
    return transfer_result;
}
export function is_minting_account(owner) {
    return owner.toText() === state.minting_account?.owner.toText();
}
