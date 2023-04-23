import {$query, $update, blob, ic, nat, Vec} from "azle";
import {state} from "./state";
import {StakingAccount, StakingClaimResponse, StakingResponse} from "./types";
import {durationToSeconds, stringToUint8, uint8ArrayToHexString, uint8ToString, hexStringToUint8Array} from "./utils";
import {handle_transfer} from "./transfer/transfer";
import {is_subaccount_valid} from "./transfer/validate";
import {get_transactions} from "./api";

$query
export function getStakingAccount(principal: string): Vec<StakingAccount> {
    if (!state.stakingAccountsState) {
        return [];
    }
    return state.stakingAccountsState[principal] || [];
}

$update
export function startStaking(subaccount: blob, amount: nat, uniqueMemo: string): StakingResponse {
    const caller = ic.caller();
    const id = ic.id();
    console.log("caller", caller.toText());
    if (!is_subaccount_valid(subaccount)) {
        return {Err: `Subaccount must be 32 bytes in length ${subaccount.length}`};
    }
    if (amount <= 0) {
        return {Err: `Amount must be greater than 0 it's ${amount}`};
    }
    if (!state.stakingAccountsState) {
        state.stakingAccountsState = {};
    }
    console.log("checking null?")
    const stakingAccount = state.stakingAccountsState[caller.toText()];
    if (!stakingAccount) {
        state.stakingAccountsState[caller.toText()] = [];
    }
    console.log("staking account not null");

    const transactions = get_transactions(0n, 200n);
    console.log(transactions.length + " transactions found");
    const transfer = transactions.find((transaction) => {
        const args = transaction?.args;
        const memo = args?.memo;
        const innerAmount = args?.amount;
        const to = args?.to;
        const ownerId = to?.owner?.toText?.();
        const innerSubaccount = to?.subaccount;
        return memo && uint8ToString(memo) === uniqueMemo &&
            innerAmount === amount && ownerId === id.toText() &&
            innerSubaccount && uint8ArrayToHexString(innerSubaccount) === uint8ArrayToHexString(subaccount);
    });
    if (!transfer) {
        return {Err: "No staking transfer found"};
    }

    const stake = {
        principal: caller.toText(),
        accountId: uint8ArrayToHexString(subaccount),
        startStakeDate: ic.time(),
        endStakeDate: null,
        amount,
        reward: null
    };
    state.stakingAccountsState[caller.toText()].push(stake);
    return {Ok: stake};
}

$update
export function startEndStaking(subaccount: blob): StakingResponse {
    const caller = ic.caller();
    if (!state.stakingAccountsState) {
        return {Err: "No staking accounts created"};
    }
    const stakingAccount = state.stakingAccountsState[caller.toText()];
    console.log(stakingAccount.length + " staking accounts found");

    if (!stakingAccount) {
        return {Err: "No staking accounts found"};
    }

    if (!is_subaccount_valid(subaccount)) {
        return {Err: "Subaccount must be 32 bytes in length"};
    }

    // @ts-ignore
    const singleStakingAccount = stakingAccount.find((stake) => stake.accountId === uint8ArrayToHexString(subaccount));

    if (!singleStakingAccount) {
        return {Err: "No staking account found"};
    }

    singleStakingAccount.endStakeDate = ic.time() + durationToSeconds(state.stakeDuration);
    return {Ok: singleStakingAccount};
}

$update
export function claimStaking(subaccount: blob): StakingClaimResponse {
    const caller = ic.caller();
    const id = ic.id();
    if (!state.stakingAccountsState) {
        return {Err: "No staking accounts found"};
    }
    const stakingAccount = state.stakingAccountsState[caller.toText()];
    if (!stakingAccount) {
        return {Err: "No staking accounts found"};
    }

    if (!is_subaccount_valid(subaccount)) {
        return {Err: "Subaccount must be 32 bytes in length"};
    }
    // @ts-ignore
    const singleStakingAccount = stakingAccount.find((stake) => stake.accountId === uint8ArrayToHexString(subaccount));

    if (!singleStakingAccount) {
        return {Err: "No staking account found"};
    }

    if (!singleStakingAccount.endStakeDate ) {
        return {Err: "Staking has not started unstaking"};
    }

    if (singleStakingAccount.endStakeDate > ic.time()) {
        return {Err: "Staking period is not over"};
    }

    const claim = singleStakingAccount.amount + (singleStakingAccount.reward || 0n);
    handle_transfer({
        amount: claim,
        created_at_time: ic.time(),
        fee: null,
        from_subaccount: subaccount,
        memo: stringToUint8("stakingClaim"),
        to: {
            owner: caller,
            subaccount: null
        }
    }, {
        owner: id,
        subaccount
    });
    state.stakingAccountsState[caller.toText()] = stakingAccount.filter((stake) => stake.accountId !== singleStakingAccount.accountId);
    return {Ok: claim};
}

