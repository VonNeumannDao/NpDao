import {ic, Opt, $init, $preUpgrade, $postUpgrade, StableBTreeMap} from 'azle';
import { state } from './state';
import { handle_mint } from './transfer/mint';
import { is_subaccount_valid, stringify } from './transfer/validate';

import {
    Account,
    InitialAccountBalance, State,
    TransferArgs
} from './types';
import {MINTING_ACCOUNT} from "./constants";

let stableStorage = new StableBTreeMap<string, string>(0, 25, 1_000);

$preUpgrade;
export function preUpgrade(): void {
    console.log('This runs before every canister upgrade');
}

$postUpgrade;
export function postUpgrade(): void {
    console.log('This runs after every canister upgrade');
}
$init;
export function init(): void {
    console.log('this runs the init');
    state.init_ran = true;
    const mintingAccount: Account = MINTING_ACCOUNT;

    state.decimals = 8;
    state.fee = 0n;
    state.name = "Sardines are Good";
    state.minting_account = validate_minting_account(mintingAccount);
    state.supported_standards = [
        {
            name: 'ICRC-1',
            url: 'https://github.com/dfinity/ICRC-1'
        }
    ];
    state.symbol = "SAG";
    state.metadata = [
        ['icrc1:decimals', { Nat: BigInt(state.decimals) }],
        ['icrc1:fee', { Nat: state.fee }],
        ['icrc1:name', { Text: state.name }],
        ['icrc1:symbol', { Text: state.symbol }]
    ];
    initialize_account_balance({
        account: {
            subaccount: null,
            owner: ic.id()
        },
        balance: 100000000000000n
    });
}

function validate_minting_account(minting_account: Opt<Account>): Opt<Account> {
    if (
        minting_account !== null &&
        is_subaccount_valid(minting_account.subaccount) === false
    ) {
        ic.trap(`subaccount for minting account must be 32 bytes in length`);
    }

    return minting_account;
}

function initialize_account_balance(
    initial_account_balance: InitialAccountBalance
) {
    if (
        is_subaccount_valid(initial_account_balance.account.subaccount) ===
        false
    ) {
        ic.trap(
            `subaccount for initial account ${initial_account_balance.account.owner.toText()} must be 32 bytes in length`
        );
    }

    const args: TransferArgs = {
        amount: initial_account_balance.balance,
        created_at_time: ic.time(),
        fee: null,
        from_subaccount: null,
        memo: null,
        to: initial_account_balance.account
    };

    const mint_result = handle_mint(args, state.minting_account);

    if ('Err' in mint_result) {
        ic.trap(stringify(mint_result.Err));
    }
}
