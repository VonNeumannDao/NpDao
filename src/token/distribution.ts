import {$query, $update, ic, nat, Principal} from "azle";
import {TOKEN_DISTRIBUTION_ACCOUNT, XTCToken} from "./constants";
import {handle_transfer} from "./transfer/transfer";
import {balance_of} from "./account";
import {state} from "./state";

const xtcToken = new XTCToken(
    Principal.fromText('aanaa-xaaaa-aaaah-aaeiq-cai')
);

$update;
export async function distributeToken(donatedAmount: nat): Promise<string> {
    const caller = ic.caller();
    const myId = ic.id();
    const balance = balance_of(TOKEN_DISTRIBUTION_ACCOUNT);
    const amountBought = (donatedAmount * state.distributionExchangeRate) / 10000n ;
    if (balance < amountBought) {
        return "not enough balance";
    }

    const transfer = await xtcToken.transferFrom(caller, myId, donatedAmount).call();

    if ("Err" in transfer) {
        return `error occurred while transferring tokens: ${transfer.Err}`;
    }
    handle_transfer({
        amount: amountBought,
        created_at_time: null,
        fee: null,
        from_subaccount: TOKEN_DISTRIBUTION_ACCOUNT.subaccount,
        memo: null,
        to: {
            owner: caller,
            subaccount: null
        }
    }, TOKEN_DISTRIBUTION_ACCOUNT);

    await xtcToken.burn({amount: donatedAmount, canister_id: Principal.fromText("4dybz-kiaaa-aaaap-qba4q-cai")}).call();
    return `${amountBought} tokens transferred to ${caller.toText()}`;
}

$query
export function distributionBalance(): nat {
    return balance_of(TOKEN_DISTRIBUTION_ACCOUNT);
}

$query
export function distributionExchangeRate(): nat {
    return state.distributionExchangeRate;
}

$update;
export async function burnAllXtc(): Promise<nat> {
    const myId = ic.id();
    const balance = await xtcToken.balanceOf(myId).call();
    await xtcToken.burn({amount: balance.Ok || 0n, canister_id: Principal.fromText("4dybz-kiaaa-aaaap-qba4q-cai")}).call();
    return balance.Ok || 0n;
}

