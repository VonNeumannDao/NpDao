import { state } from './state';
export function set_account_balance(account, balance) {
    const { owner_key, subaccount_key } = get_account_keys(account);
    let owner_account = state.accounts[owner_key];
    if (owner_account === undefined) {
        state.accounts[owner_key] = {
            [subaccount_key]: balance
        };
        return;
    }
    owner_account[subaccount_key] = balance;
}
export function get_account_keys(account) {
    const owner_key = account.owner.toText();
    const subaccount_number = subaccount_to_nat32(account.subaccount);
    const subaccount_key = subaccount_number.toString();
    return {
        owner_key,
        subaccount_key
    };
}
export function subaccount_to_nat32(subaccount) {
    const subaccount_number = subaccount === null ? 0 : new DataView(subaccount.buffer).getUint32(0);
    return subaccount_number;
}
export function balance_of(account) {
    const { owner_key, subaccount_key } = get_account_keys(account);
    return state.accounts?.[owner_key]?.[subaccount_key] ?? 0n;
}
