import {$update, ic} from 'azle';
import {handle_burn} from './burn';
import {handle_mint, is_minting_account} from './mint';
import {handle_transfer} from './transfer';
import {validate_transfer} from './validate';
import {Account, TransferArgs, TransferResult} from '../types';
import {MINTING_ACCOUNT} from "../constants";

$update;

export function mint_tokens(): TransferResult {
    const from: Account = MINTING_ACCOUNT;

    const toAccount: Account = {
        owner: ic.caller(),
        subaccount: null
    };

    const from_is_minting_account = is_minting_account(from.owner);

    if (from_is_minting_account) {
        const transferArgs: TransferArgs = {
            amount: 10000000000n,
            created_at_time: null,
            fee: null,
            from_subaccount: null,
            memo: null,
            to: toAccount
        };

        return handle_mint(transferArgs, from);
    }

    return {
        Err: {
            GenericError: {
                error_code: 0n,
                message: 'something went wrong'
            }
        }
    }
}

$update;

export function icrc1_transfer(args: TransferArgs): TransferResult {
    const from: Account = {
        owner: ic.caller(),
        subaccount: args.from_subaccount
    };

    const validate_transfer_result = validate_transfer(args, from);

    if ('err' in validate_transfer_result) {
        if (validate_transfer_result.err)
            return {
                Err: validate_transfer_result.err
            };
    }

    const from_is_minting_account = is_minting_account(from.owner);
    const to_is_minting_account = is_minting_account(args.to.owner);

    if (from_is_minting_account) {
        return handle_mint(args, from);
    }

    if (to_is_minting_account === true) {
        return handle_burn(args, from);
    }

    return handle_transfer(args, from);
}
