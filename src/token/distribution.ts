import {$query, $update, ic, nat, Principal} from "azle";
import {ICP_DISTRIBUTION_ACCOUNT, XTC_DISTRIBUTION_ACCOUNT, XTCToken} from "./constants";
import {handle_transfer} from "./transfer/transfer";
import {balance_of} from "./account";
import {state} from "./state";
import prodCanister from "../../canister_ids.json";

const xtcToken = new XTCToken(
    Principal.fromText('aanaa-xaaaa-aaaah-aaeiq-cai')
);


$update
export async function icpDistributeToken(donatedAmount: nat): Promise<string> {
    const caller = ic.caller();
    const balance = balance_of(ICP_DISTRIBUTION_ACCOUNT);
    const amountBought = (donatedAmount * state.xtcDistributionExchangeRate) / 10000n ;
    if (balance < amountBought) {
        return "not enough balance";
    }
    return `${amountBought} tokens transferred to ${caller.toText()}`;
}


$update;
export async function xtcDistributeToken(donatedAmount: nat): Promise<string> {
    const caller = ic.caller();
    const myId = ic.id();
    const balance = balance_of(XTC_DISTRIBUTION_ACCOUNT);
    const amountBought = (donatedAmount * state.xtcDistributionExchangeRate) / 10000n ;
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
        from: XTC_DISTRIBUTION_ACCOUNT,
        memo: null,
        to: {
            owner: caller,
            subaccount: null
        }
    }, XTC_DISTRIBUTION_ACCOUNT);

    await xtcToken.burn({amount: donatedAmount, canister_id: Principal.fromText(prodCanister.token.ic)}).call();
    return `${amountBought} tokens transferred to ${caller.toText()}`;
}

$query
export function xtcDistributionBalance(): nat {
    return balance_of(XTC_DISTRIBUTION_ACCOUNT);
}

$query
export function icpDistributionBalance(): nat {
    return balance_of(ICP_DISTRIBUTION_ACCOUNT);
}

$query
export function xtcDistributionExchangeRate(): nat {
    return state.xtcDistributionExchangeRate;
}

$query
export function icpDistributionExchangeRate(): nat {
    return state.icpDistributionExchangeRate;
}

$update;
export async function burnAllXtc(): Promise<nat> {
    const myId = ic.id();
    const balance = await xtcToken.balanceOf(myId).call();
    await xtcToken.burn({amount: balance.Ok || 0n, canister_id: Principal.fromText(prodCanister.token.ic)}).call();
    return balance.Ok || 0n;
}

