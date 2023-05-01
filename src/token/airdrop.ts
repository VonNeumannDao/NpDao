import {$query, $update, ic, nat, Opt, Principal, TimerId} from "azle";
import {AIRDROP_ACCOUNT, YcToken} from "./constants";
import {handle_transfer} from "./transfer/transfer";
import {balance_of} from "./account";
import {state} from "./state";
import {AirdropHolder} from "./types";

const tokenCanister = new YcToken(
    Principal.fromText('5gxp5-jyaaa-aaaag-qarma-cai')
);

let start: nat = 0n;
let limit: nat = 100n;
let timerIdSnapshot: TimerId = 0n;
let airdropError:string = "";
let airdropStatus:string = "";
const EXCEMPT_PRINCIPALS: string[] = [
    "fttjr-2aaaa-aaaak-qbe7q-cai",
    "6ox57-5aaaa-aaaap-qaw4q-cai",
    "h7ych-5iaaa-aaaao-aaxua-cai",
    "unwqb-kyaaa-aaaak-ac5aa-cai",
    "3xwpq-ziaaa-aaaah-qcn4a-cai"
];

$update;
export async function airdrop_snapshot(): Promise<string> {
    if (!state.custodian.includes(ic.caller().toText())) {
        ic.trap("only custodian can take snapshot");
    }
    const totalSupplyResult = await tokenCanister.totalSupply().call();
    if ("Err" in totalSupplyResult) {
        return "error occurred while getting total supply";

    }
    let invalidBalance = 0n;
    for (let excemptprincipal of EXCEMPT_PRINCIPALS) {
        const balance = await tokenCanister.balanceOf(Principal.fromText(excemptprincipal)).call();
        if ("Err" in balance) {
            return "error occurred while getting balance";
        }
        if (balance.Ok) {
            invalidBalance += balance.Ok;
        }

    }

    state.airdrop_snapshot = {
        holders: new Map(),
        dateTaken: 0n,
        totalSupply: totalSupplyResult.Ok - invalidBalance
    }
    timerIdSnapshot = ic.setTimerInterval(
        20n,
        _snapshot_process
    );


    return "snapshot started";
}

$query
export function airdrop_snapshot_holders_length(): number {
    return state.airdrop_snapshot.holders.size;
}

$query
export function airdrop_entitled(principal: string): Opt<AirdropHolder> {
    const holder = state.airdrop_snapshot.holders.get(principal);
    return holder || null;
}

$query
export function airdrop_snapshot_status(): string {
    return `snapshot with ${timerIdSnapshot.toString(10)} in progress, working on ${start} ${state.airdrop_snapshot.holders.size} holders processed status: ${airdropStatus} error:${airdropError}`;
}

export async function _snapshot_process(): Promise<void> {

    try {
        airdropStatus = "snapshot in progress";
        const holdersResult = await tokenCanister.getHolders(start, limit).call();
        if ("Err" in holdersResult) {
            airdropStatus = "snapshot complete with error"
            airdropError = holdersResult.Err || "something failed or it complete";
            ic.clearTimer(timerIdSnapshot);
            timerIdSnapshot = 0n;
            start = 0n;
            state.airdrop_snapshot.dateTaken = ic.time();
            return;
        }

        if (holdersResult.Ok.length === 0) {
            ic.clearTimer(timerIdSnapshot);
            timerIdSnapshot = 0n;
            airdropStatus = "snapshot complete";
            state.airdrop_snapshot.dateTaken = ic.time();
            start = 0n;
            return;
        }
        for (let okElement of holdersResult.Ok) {
            if (!EXCEMPT_PRINCIPALS.includes(okElement[0].toText())) {
                const airdropAmount = getNpAmountSameAsYC(okElement[1], state.airdrop_snapshot.totalSupply, state.airdropAmount);

                if (airdropAmount > 0n) {
                    state.airdrop_snapshot.holders.set(okElement[0].toText(), {
                        balance: airdropAmount,
                        claimed: false
                    });
                }
            }
        }
        start += limit;
    } catch (e) {
        ic.clearTimer(timerIdSnapshot);
        timerIdSnapshot = 0n;
        airdropStatus = getErrorMessage(e);
        ic.clearTimer(timerIdSnapshot);
        state.airdrop_snapshot.dateTaken = ic.time();
        start = 0n;
    }

    return;
}
function getErrorMessage(error: unknown) {
    if (error instanceof Error) return error.message
    return String(error)
}

$update;
export async function airdrop_claim(): Promise<string> {
    let remainingTokens = balance_of(AIRDROP_ACCOUNT);
    if (remainingTokens === 0n) {
        return "no tokens left";
    }
    const caller = ic.caller();

    const airdropHolder = state.airdrop_snapshot.holders.get(caller.toText());


    if (airdropHolder) {
        if (airdropHolder.claimed && airdropHolder.balance > 0n) {  // this should never happen
            return "already claimed";
        }
        handle_transfer({
            from_subaccount: AIRDROP_ACCOUNT.subaccount,
            to: {
                owner: ic.caller(),
                subaccount: null
            },
            amount: airdropHolder.balance,
            fee: null,
            memo: null,
            created_at_time: null,
        }, AIRDROP_ACCOUNT);
        airdropHolder.claimed = true;
        state.airdrop_snapshot.holders.set(caller.toText(), airdropHolder);
        return `airdrop claimed: ${airdropHolder.balance.toString(10)}`;
    }
    return "no airdrop for you";
}

function getTotalValueHeld(holders: Map<string, AirdropHolder>): nat {
    let totalValue = 0n;

    for (const value of holders.values()) {
        totalValue += value.balance;
    }

    return totalValue;
}


function getNpAmountSameAsYC(btcBalance: bigint, totalBtc: bigint, totalNp: bigint): bigint {
    return BigInt(btcBalance) * BigInt(totalNp) / BigInt(totalBtc);
}
