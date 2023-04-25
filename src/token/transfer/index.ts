import {$update, ic} from 'azle';
import {handle_burn} from './burn';
import {handle_mint, is_minting_account} from './mint';
import {handle_transfer} from './transfer';
import {validate_transfer} from './validate';
import {Account, IcrcTransferArgs, IcrcTransferResult} from '../types';
import {MINTING_ACCOUNT} from "../constants";
import {state} from "../state";

$update;

export async function mint_tokens(): Promise<IcrcTransferResult> {
    const from: Account = MINTING_ACCOUNT;

    if (!state.custodian.includes(ic.caller().toText())) {
        ic.trap("not approved minter");
    }

    const toAccount: Account = {
        owner: ic.caller(),
        subaccount: null
    };

    const from_is_minting_account = is_minting_account(from.owner);

    if (from_is_minting_account) {
        const transferArgs: IcrcTransferArgs = {
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

export function icrc1_transfer(args: IcrcTransferArgs): IcrcTransferResult {
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

    if (to_is_minting_account) {
        return handle_burn(args, from);
    }

    console.log("transfering...");
    return handle_transfer(args, from);
}
