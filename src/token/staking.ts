import {$query, $update, blob, ic, nat, nat64, Opt, Vec} from "azle";
import {state} from "./state";
import {Account, StakingAccount, StakingClaimResponse, StakingResponse} from "./types";
import {durationToSeconds, stringToUint8, uint8ArrayToHexString, uint8ToString, hexStringToUint8Array} from "./utils";
import {handle_transfer} from "./transfer/transfer";
import {is_subaccount_valid} from "./transfer/validate";
import {get_transactions, icrc1_transfer} from "./api";


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
    return state.stakingAccountsState[principal] || [];
}

$update
export function brokenStakeRefund(): boolean {
    const caller = ic.caller();
    const stakingAccounts = getStakingAccount(caller.toText());

    //if there are no staking accounts, there is nothing to refund
    if (stakingAccounts.length === 0) {
        return false;
    }

    // @ts-ignore get staking transaction
    const transactions = get_transactions(0n).filter(x => x.from.owner.toText() === caller.toText()).filter(x => x.args.memo).filter(x => uint8ToString(x.args.memo).startsWith("stake"));
    if (transactions.length === 0) {
        return false;
    }

    //if there are more staking accounts than transactions, refund the difference
    if (stakingAccounts.length === transactions.length) {
        return false;
    }

    for (let transaction of transactions) {
        // @ts-ignore
        const stringMemo = uint8ToString(transaction.args.memo);
        //every transaction should have a matching staking account
        const matchingStakingAccount = stakingAccounts.find(x => x.memo == stringMemo);
        if (!matchingStakingAccount) {
            if (transaction.args) {
                icrc1_transfer({
                    amount: transaction.args.amount,
                    created_at_time: null,
                    fee: null,
                    from_subaccount: transaction.args.to.subaccount,
                    memo: stringToUint8("Refund for broken stake"),
                    to: {
                        owner: caller,
                        subaccount: null
                    }
                });
                return true;
            }
        }
    }

    return false;
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

    const stake: StakingAccount = {
        principal: caller.toText(),
        accountId: uint8ArrayToHexString(subaccount),
        startStakeDate: ic.time(),
        endStakeDate: null,
        amount,
        reward: null,
        memo: uniqueMemo,
        claimed: false
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
    singleStakingAccount.claimed = true;
    return {Ok: claim};
}

