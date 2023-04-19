import { state } from './state';
import { $query, $update, ic } from "azle";
import { handle_burn } from "./transfer/burn";
import { balance_of } from "./account";
import { handle_transfer } from "./transfer/transfer";
import { managementCanister } from 'azle/canisters/management';
import { DAO_TREASURY } from "./constants";
import { registerCanister } from "./canister_registry";
let timerId = null;
$query;
export function pastProposals() {
    const proposals = state.proposals.values();
    const view = [];
    for (let proposal of proposals) {
        view.push({
            id: proposal.id,
            proposer: proposal.proposer,
            title: proposal.title,
            description: proposal.description,
            endTime: proposal.endTime,
            proposalType: proposal.proposalType,
            executed: proposal.executed,
            ended: proposal.ended,
            amount: proposal.amount,
            receiver: proposal.receiver
        });
    }
    return view;
}
$query;
export function activeProposal() {
    if (!state.proposal) {
        return {
            Err: "No active proposal"
        };
    }
    const proposal = state.proposal;
    const view = {
        id: proposal.id,
        proposer: proposal.proposer,
        title: proposal.title,
        description: proposal.description,
        endTime: proposal.endTime,
        proposalType: proposal.proposalType,
        executed: proposal.executed,
        ended: proposal.ended,
        amount: proposal.amount,
        receiver: proposal.receiver
    };
    return {
        Ok: view
    };
}
$query;
export function voteStatus() {
    if (!state.proposal) {
        return {
            Err: "No active proposal"
        };
    }
    const voteStatus = {
        voteNo: 0n,
        voteYes: 0n,
        myVoteYes: 0n,
        myVoteNo: 0n
    };
    for (let entry of Object.values(state.proposal.votes)) {
        voteStatus.voteNo += entry.voteNo;
        voteStatus.voteYes += entry.voteYes;
    }
    const myVotes = state.proposal.votes[ic.caller().toText()];
    if (myVotes) {
        voteStatus.myVoteYes = myVotes.voteYes;
        voteStatus.myVoteNo = myVotes.voteNo;
    }
    return { Ok: voteStatus };
}
$update;
export async function createWasmProposal(account, description, title, wasm, args, canister) {
    if (account.owner !== ic.caller()) {
        return {
            Err: {
                AccessDenied: null
            }
        };
    }
    const canisterStatusResultCallResult = await managementCanister
        .canister_status({
        canister_id: ic.id()
    })
        .call();
    if (canisterStatusResultCallResult.Err) {
        return {
            Err: {
                other: canisterStatusResultCallResult.Err
            }
        };
    }
    const cycleCount = canisterStatusResultCallResult.Ok?.cycles;
    // @ts-ignore
    if (cycleCount < 3000000000000n) {
        return {
            Err: {
                InsufficientCycles: { balance: cycleCount }
            }
        };
    }
    if (state.proposal !== null) {
        return {
            Err: { ExistingProposal: null }
        };
    }
    const transferArgs = {
        amount: state.proposalCost,
        created_at_time: null,
        fee: null,
        from_subaccount: null,
        memo: null,
        to: DAO_TREASURY
    };
    const balance = balance_of(account);
    if (balance < state.proposalCost) {
        return {
            Err: {
                InsufficientFunds: { balance }
            }
        };
    }
    handle_burn(transferArgs, account);
    const endTime = ic.time() + BigInt(state.duration * 1e8);
    const proposal = {
        id: state.proposalCount,
        title,
        proposer: account,
        description,
        executed: false,
        votes: {},
        proposalType: { installAppAction: null },
        endTime,
        amount: null,
        receiver: null,
        error: null,
        ended: false,
        wasm: wasm,
        canister,
        args
    };
    state.proposalCount++;
    state.proposal = proposal;
    state.proposals.set(proposal.id, proposal);
    return { Ok: proposal.id };
}
$update;
export function createTreasuryProposal(account, description, title, receiver, amount) {
    if (account.owner.toText() !== ic.caller().toText()) {
        return {
            Err: {
                AccessDenied: null
            }
        };
    }
    if (state.proposal !== null) {
        return {
            Err: { ExistingProposal: null }
        };
    }
    const transferArgs = {
        amount: state.proposalCost,
        created_at_time: null,
        fee: null,
        from_subaccount: null,
        memo: null,
        to: DAO_TREASURY
    };
    const balance = balance_of(account);
    if (balance < state.proposalCost) {
        return {
            Err: {
                InsufficientFunds: { balance }
            }
        };
    }
    handle_burn(transferArgs, account);
    const endTime = ic.time() + BigInt(state.duration * 1e8);
    const proposal = {
        id: state.proposalCount,
        title,
        proposer: account,
        description,
        executed: false,
        votes: {},
        proposalType: { treasuryAction: null },
        endTime,
        amount: amount,
        receiver: receiver,
        error: null,
        ended: false,
        wasm: null,
        canister: null,
        args: null
    };
    state.proposalCount++;
    state.proposal = proposal;
    state.proposals.set(proposal.id, proposal);
    return { Ok: proposal.id };
}
$update;
export function vote(account, proposalId, voteAmount, direction) {
    if (account.owner === ic.caller()) {
        return {
            Err: {
                AccessDenied: null
            }
        };
    }
    const proposal = state.proposals.get(proposalId);
    if (!proposal) {
        return {
            Err: {
                ProposalNotFound: null
            }
        };
    }
    if (proposal.endTime < BigInt(Date.now())) {
        return {
            Err: {
                VotingPeriodEnded: null
            }
        };
    }
    const balance = balance_of(account);
    // @ts-ignore
    if (balance <= voteAmount) {
        return {
            Err: {
                InsufficientFunds: { balance }
            }
        };
    }
    const voter = account.owner;
    const mintingAccount = {
        subaccount: null,
        owner: ic.id()
    };
    const voteProposal = proposal.votes[voter.toText()];
    const vote = voteProposal ? voteProposal : {
        voter,
        voteYes: 0n,
        voteNo: 0n
    };
    if (direction) {
        vote.voteYes += voteAmount;
    }
    else {
        vote.voteNo += voteAmount;
    }
    proposal.votes[voter.toText()] = vote;
    const transferArgs = {
        amount: voteAmount,
        created_at_time: null,
        fee: null,
        from_subaccount: null,
        memo: null,
        to: mintingAccount
    };
    handle_burn(transferArgs, account);
    return { Ok: proposalId };
}
$update;
export function clearTimer() {
    if (timerId) {
        ic.clearTimer(timerId);
        timerId = null;
    }
    console.log(`timer ${timerId} cancelled`);
}
$update;
export function startTimer() {
    if (timerId) {
        console.log("this is happening");
        ic.trap("timer already exists");
    }
    console.log("this is happening", timerId);
    // @ts-ignore
    timerId = ic.setTimerInterval(60n, _executeProposal);
    return timerId;
}
async function _executeProposal() {
    const proposal = state.proposal;
    if (!proposal) {
        ic.trap("proposal none existent");
        return;
    }
    if (proposal.endTime >= ic.time()) {
        proposal.error = {
            VotingOngoing: null
        };
        state.proposals.set(proposal?.id, proposal);
        ic.trap("Voting Ongoing");
        return;
    }
    if (proposal.executed) {
        proposal.error = {
            AlreadyExecuted: null
        };
        state.proposals.set(proposal?.id, proposal);
        state.proposal = null;
        ic.trap("Already Executed");
        return;
    }
    // Check if the proposal has enough votes to pass.
    // You can set your own threshold.
    let totalVotesYes = BigInt(0);
    let totalVotesNo = BigInt(0);
    for (const vote of Object.values(proposal.votes)) {
        totalVotesYes += vote.voteYes;
        totalVotesNo += vote.voteNo;
    }
    proposal.executed = totalVotesNo <= totalVotesYes;
    if (proposal.executed) {
        const type = proposal.proposalType;
        if ("treasuryAction" in type) {
            const transferArgs = {
                amount: proposal.amount,
                created_at_time: null,
                fee: null,
                from_subaccount: null,
                memo: null,
                to: proposal.receiver
            };
            handle_transfer(transferArgs, DAO_TREASURY);
            console.log("transfer succeeded");
        }
        else if ("InstallAppAction" in type) {
            let canisterId = proposal.canister;
            if (!canisterId) {
                const createCanisterResultCallResult = await managementCanister
                    .create_canister({
                    settings: null
                })
                    .cycles(1500000000000n)
                    .call();
                if (createCanisterResultCallResult.Err) {
                    proposal.error = {
                        other: createCanisterResultCallResult.Err
                    };
                    state.proposals.set(proposal?.id, proposal);
                    return;
                }
                canisterId = (createCanisterResultCallResult.Ok?.canister_id);
            }
            const callResult = await managementCanister
                .install_code({
                mode: {
                    install: null
                },
                canister_id: canisterId,
                wasm_module: proposal.wasm,
                arg: proposal.args
            })
                .call();
            if (callResult.Err) {
                proposal.error = {
                    other: callResult.Err
                };
                state.proposals.set(proposal?.id, proposal);
            }
            else {
                proposal.wasm = null;
                registerCanister(proposal.endTime.toString(10), canisterId.toText());
                state.proposals.set(proposal?.id, proposal);
            }
        }
    }
    proposal.ended = true;
    state.proposals.set(proposal?.id, proposal);
    state.proposal = null;
}
