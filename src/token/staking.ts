import {$query, $update, blob, ic, nat, Vec} from "azle";
import {state} from "./state";
import {StakingAccount, StakingClaimResponse, StakingResponse} from "./types";
import {durationToSeconds, stringToUint8, uint8ArrayToHexString, uint8ToString} from "./utils";
import {is_subaccount_valid} from "./transfer/validate";
import {get_transactions} from "./api";
import {MINTING_ACCOUNT} from "./constants";
import {handle_mint} from "./transfer/mint";
import {handle_burn} from "./transfer/burn";

export const STAKING_REWARDS_TICK_FREQUENCY = 60;
$query
export function getTotalStaked(principal: string): nat {
    const stakingAccounts = getStakingAccount(principal).filter(x => !x.claimed);

    let voteAmount = 0n;
    for (let stakingAccount of stakingAccounts) {
        voteAmount += stakingAccount.amount + (stakingAccount.reward || 0n);
    }
    return voteAmount;
}

$query

export function getStakingAccount(principal: string): Vec<StakingAccount> {
    if (!state.stakingAccountsState) {
        return [];
    }
    return state.stakingAccountsState.get(principal) || [];
}

export function _rewardTick(): void {
    console.log("this is happening", state.stakingAccountsState?.size);
    if (state.stakingAccountsState)
    state.stakingAccountsState.forEach((stakingAccounts) => {
        stakingAccounts.forEach((stakingAccount) => {
            if (!stakingAccount.endStakeDate) {
                stakingAccount.total = stakingAccount.amount + (stakingAccount.reward || 0n);
                stakingAccount.reward = calculateRewardsPerMinute(stakingAccount.total, state.rewardsPercent);
                console.log(stakingAccount.amount, stakingAccount.reward);
            }
        });
    });
}
function calculateRewardsPerMinute(stakedAmount: bigint, apyPercent: number): bigint {
    const minutesPerYear = 525600;
    const scaleFactor = BigInt(10 ** 18);

    const apyDecimal = 1 + (apyPercent / 100);
    const apyRatePerMinute = Math.pow(apyDecimal, 1 / minutesPerYear) - 1;

    const apyRatePerMinuteBigInt = BigInt(Math.floor(apyRatePerMinute * Number(scaleFactor)));

    return stakedAmount * apyRatePerMinuteBigInt / scaleFactor;
}

$update
export function startStaking(subaccount: blob, amount: nat, blockNumber: nat): StakingResponse {
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
        state.stakingAccountsState = new Map<string, Vec<StakingAccount>>();
    }
    console.log("checking null?")
    const stakingAccount = state.stakingAccountsState.get(caller.toText());
    if (!stakingAccount) {
        state.stakingAccountsState.set(caller.toText(), []);
    }
    console.log("staking account not null");

    const {transactions} = get_transactions({start: 0n, length: 200n});
    console.log(transactions.length + " transactions found");
    const transfer = transactions.find((transaction) => {
        if (transaction.transaction) {
            const block = transaction.id;

            // @ts-ignore
            const innerAmount = transaction.transaction.transfer.amount;
            // @ts-ignore
            const ownerId = transaction.transaction.transfer.to.owner.toText();
            // @ts-ignore
            const memo = transaction.transaction.transfer.memo;
            // @ts-ignore
            const innerSubaccount = transaction.transaction.transfer.to.subaccount;
            return memo && uint8ToString(memo) === "Stake" &&
                block === blockNumber &&
                innerAmount === amount && ownerId === id.toText() &&
                innerSubaccount && uint8ArrayToHexString(innerSubaccount) === uint8ArrayToHexString(subaccount);
        }

    });


    if (!transfer) {
        return {Err: "No staking transfer found"};
    }

    handle_burn({
        amount: amount,
        created_at_time: ic.time(),
        fee: null,
        from_subaccount: subaccount,
        memo: stringToUint8("StakeBurn"),
        to: MINTING_ACCOUNT
    }, {
        owner: id,
        subaccount
    });

    const stake: StakingAccount = {
        principal: caller.toText(),
        accountId: uint8ArrayToHexString(subaccount),
        startStakeDate: ic.time(),
        endStakeDate: null,
        amount,
        reward: 0n,
        claimed: false,
        total: amount
    };
    state.stakingAccountsState.get(caller.toText())?.push(stake);
    return {Ok: stake};
}

$update

export function startEndStaking(subaccount: blob): StakingResponse {
    const caller = ic.caller();
    if (!state.stakingAccountsState) {
        return {Err: "No staking accounts created"};
    }
    const stakingAccount = state.stakingAccountsState.get(caller.toText());
    console.log(stakingAccount?.length + " staking accounts found");

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

export function claimStaking(index: number): StakingClaimResponse {
    const caller = ic.caller();
    const id = ic.id();
    if (!state.stakingAccountsState) {
        return {Err: "No staking accounts found"};
    }
    const stakingAccount = state.stakingAccountsState.get(caller.toText());
    if (!stakingAccount) {
        return {Err: "No staking accounts found"};
    }
    // @ts-ignore
    const singleStakingAccount = stakingAccount[index]

    if (!singleStakingAccount) {
        return {Err: "No staking account found"};
    }

    if (!singleStakingAccount.endStakeDate) {
        return {Err: "Staking has not started unstaking"};
    }

    if (singleStakingAccount.endStakeDate > ic.time()) {
        return {Err: "Staking period is not over"};
    }

    const claim = singleStakingAccount.amount + (singleStakingAccount.reward || 0n);

    handle_mint({
        amount: claim,
        created_at_time: ic.time(),
        fee: null,
        from_subaccount: MINTING_ACCOUNT.subaccount,
        memo: stringToUint8("stakingClaim"),
        to: {
            owner: caller,
            subaccount: null
        }
    }, MINTING_ACCOUNT);

    singleStakingAccount.claimed = true;
    return {Ok: claim};
}

