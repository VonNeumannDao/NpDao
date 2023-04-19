import { balance_of } from './account';
import { $query } from 'azle';
import { state } from './state';
$query;
export function get_transactions(start, end) {
    return state.transactions.slice(start === null ? 0 : Number(start), end === null ? state.transactions.length : Number(end));
}
$query;
export function icrc1_balance_of(account) {
    return balance_of(account);
}
$query;
export function icrc1_decimals() {
    return state.decimals;
}
$query;
export function icrc1_fee() {
    return state.fee;
}
$query;
export function icrc1_metadata() {
    return state.metadata;
}
$query;
export function icrc1_minting_account() {
    return state.minting_account;
}
$query;
export function icrc1_name() {
    return state.name;
}
$query;
export function icrc1_supported_standards() {
    return state.supported_standards;
}
$query;
export function icrc1_symbol() {
    return state.symbol;
}
$query;
export function icrc1_total_supply() {
    return state.total_supply;
}
export { icrc1_transfer, mint_tokens } from './transfer';
