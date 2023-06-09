import {$update, ic, nat32, Opt, TimerId} from "azle";
import {_checkCycles, _executeProposal} from "./dao";
import {_loadTransactions, _refreshArchivedTotalTransactions} from "./Archive";
import {state} from "./state";
import {_rewardTick, STAKING_REWARDS_TICK_FREQUENCY} from "./staking";

let timerIdProposal: Opt<TimerId> = null;
let timerIdCycle: Opt<TimerId> = null;
let timerIdArchive: Opt<TimerId> = null;
let timerIdStakingRewards: Opt<TimerId> = null;

$update;
export function stopTimer(): nat32 {
    if (!state.custodian.includes(ic.caller().toText())) {
        return 401;
    }

    if (timerIdProposal)
        ic.clearTimer(timerIdProposal);

    if (timerIdCycle)
        ic.clearTimer(timerIdCycle);

    if (timerIdArchive)
        ic.clearTimer(timerIdArchive);

    return 200;
}

$update;

export function startTimer(): TimerId {
    if (timerIdProposal) {
        console.log("this is happening");
        ic.trap("timer already exists");
    }
    console.log("this is happening", timerIdProposal);

    // @ts-ignore
    timerIdProposal = ic.setTimerInterval(
        60n,
        _executeProposal
    );

    timerIdArchive = ic.setTimerInterval(
        120n,
        _loadTransactions
    );

    timerIdCycle = ic.setTimerInterval(
        3600n,
        _checkCycles
    );

    timerIdStakingRewards = ic.setTimerInterval(BigInt(STAKING_REWARDS_TICK_FREQUENCY), _rewardTick);

    ic.setTimer(60n, _refreshArchivedTotalTransactions);

    return timerIdProposal;
}