import {$query, $update, ic, nat, Principal, Record, Variant} from "azle";
import {ICP_DISTRIBUTION_ACCOUNT, XTC_DISTRIBUTION_ACCOUNT, XTCToken} from "./constants";
import {handle_transfer} from "./transfer/transfer";
import {balance_of} from "./account";
import {state} from "./state";

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
export async function xtcDistributeToken(donatedAmount: nat): Promise<Variant<{
    Ok: string;
    Err: string;
}>> {
    const caller = ic.caller();
    const myId = ic.id();
    const balance = balance_of(XTC_DISTRIBUTION_ACCOUNT);
    const amountBought = (donatedAmount * state.xtcDistributionExchangeRate) / 10000n ;
    if (balance < amountBought) {
        return {Err: "Not enough XTC in distribution" };
    }
    const xtcBalance = await xtcToken.balanceOf(caller).call();
    const balanceOf = xtcBalance.Ok || 0n;
    if ("Err" in xtcBalance || balanceOf < donatedAmount) {
        return {Err:  "Not enough xtc in your wallet"};
    }

    const transfer = await xtcToken.transferFrom(caller, myId, donatedAmount).call();

    if ("Err" in transfer) {
        return {Err: `Error occurred while transferring tokens: ${transfer.Err}`};
    }
    handle_transfer({
        amount: amountBought,
        created_at_time: null,
        fee: null,
        from_subaccount: XTC_DISTRIBUTION_ACCOUNT.subaccount,
        memo: null,
        to: {
            owner: caller,
            subaccount: null
        }
    }, XTC_DISTRIBUTION_ACCOUNT);

    const result = await xtcToken.burn({amount: donatedAmount, canister_id: myId}).call();
    return {Ok: `${amountBought} tokens transferred to ${caller.toText()} and ${result.Ok?.Ok || 0n} tokens burned to ${myId.toText()} from ${donatedAmount} donated xtc`};
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
    await xtcToken.burn({amount: balance.Ok || 0n, canister_id: myId}).call();
    return balance.Ok || 0n;
}

