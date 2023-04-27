import {$query, $update, ic, nat, Principal, TimerId} from "azle";
import {AIRDROP_ACCOUNT, YcToken} from "./constants";
import {handle_transfer} from "./transfer/transfer";
import {balance_of} from "./account";
import {state} from "./state";

const tokenCanister = new YcToken(
    Principal.fromText('5gxp5-jyaaa-aaaag-qarma-cai')
);

let start: bigint = 0n;
let limit: bigint = 200n;
let timerIdSnapshot: TimerId = 0n;
let airdropError:string = "";
let airdropStatus:string = "";
let circulatingSupply:bigint = 0n;
const EXCEMPT_PRINCIPALS: string[] = [
    "fttjr-2aaaa-aaaak-qbe7q-cai",
    "6ox57-5aaaa-aaaap-qaw4q-cai",
    "h7ych-5iaaa-aaaao-aaxua-cai",
    "unwqb-kyaaa-aaaak-ac5aa-cai",
    "3xwpq-ziaaa-aaaah-qcn4a-cai"
];

$update;
export async function airdrop_snapshot(): Promise<string> {

    const totalSupplyResult = await tokenCanister.totalSupply().call();
    if ("Err" in totalSupplyResult) {
        return "error occurred while getting total supply";
    }
    state.airdrop_snapshot = {
        holders: new Map(),
        dateTaken: 0n,
        totalSupply: totalSupplyResult.Ok
    }
    timerIdSnapshot = ic.setTimerInterval(
        30n,
        _snapshot_process
    );


    return "snapshot started";
}

$query
export function airdrop_snapshot_holders_length(): number {
    return state.airdrop_snapshot.holders.size;
}

$query
export function airdrop_entitled(): boolean {
    return state.airdrop_snapshot.holders.has(ic.caller().toText());
}

$query
export function airdrop_snapshot_status(): string {
    if (timerIdSnapshot === 0n) {
        return "complete";
    }

    return `snapshot with ${timerIdSnapshot.toString(10)} in progress, working on ${start} ${state.airdrop_snapshot.holders.size} holders processed status: ${airdropStatus} error:${airdropError}`;
}

export async function _snapshot_process(): Promise<void> {
    const holdersResult = await tokenCanister.getHolders(start, limit).call();
    if ("Err" in holdersResult) {
        airdropError = holdersResult.Err  || "something failed or it complete";
        ic.clearTimer(timerIdSnapshot);
        timerIdSnapshot = 0n;
        start = 0n;
        circulatingSupply = getTotalValueHeld(state.airdrop_snapshot.holders);
        state.airdrop_snapshot.dateTaken = ic.time();
        return;
    }

    if (holdersResult.Ok.length === 0) {
        ic.clearTimer(timerIdSnapshot);
        timerIdSnapshot = 0n;
        airdropStatus = "snapshot complete";
        circulatingSupply = getTotalValueHeld(state.airdrop_snapshot.holders);
        state.airdrop_snapshot.dateTaken = ic.time();
        start = 0n;
        return;
    }
    for (let okElement of holdersResult.Ok) {
        if (!EXCEMPT_PRINCIPALS.includes(okElement[0].toText())) {
            state.airdrop_snapshot.holders.set(okElement[0].toText(), okElement[1]);
        }
    }
    start += limit;
}

$update;
export async function airdrop_claim(): Promise<string> {
    const HOLDINGS_PERCENT_PRECISION = 100n;
    let remainingTokens = balance_of(AIRDROP_ACCOUNT);
    if (remainingTokens === 0n) {
        return "no tokens left";
    }

    const holdings = state.airdrop_snapshot.holders.get(ic.caller().toText());
    if (holdings) {
        const holdingsPercent = (holdings * HOLDINGS_PERCENT_PRECISION) / circulatingSupply;
        const airdropAmount = (holdingsPercent / HOLDINGS_PERCENT_PRECISION) * state.airdropAmount;
        handle_transfer({
            amount: airdropAmount,
            created_at_time: null,
            fee: null,
            from_subaccount: AIRDROP_ACCOUNT.subaccount,
            memo: null,
            to: {
                owner: ic.caller(),
                subaccount: null
            }
        }, AIRDROP_ACCOUNT);
        state.airdrop_snapshot.holders.delete(ic.caller().toText());
        return `airdrop claimed: ${airdropAmount.toString(10)}`;
    }
    return "no airdrop for you";
}

function getTotalValueHeld(holders: Map<string, nat>): nat {
    let totalValue = 0n;

    for (const value of holders.values()) {
        totalValue += value;
    }

    return totalValue;
}
