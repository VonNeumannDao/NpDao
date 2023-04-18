import {Principal} from "@dfinity/principal";
import {
    Account,
    ProposalResponse,
    Proposal,
    ProposalType,
    TransferArgs,
    Vote,
    VoteStatusResponse,
    VoteStatus, ProposalViewResponse, ActiveProposal
} from "./types"
import {state} from './state';
import {$update, ic, nat, nat64, $query, Vec, TimerId, Opt} from "azle";
import {handle_burn} from "./transfer/burn";
import {balance_of} from "./account";
import {icrc1_transfer} from "./transfer";
import {handle_transfer} from "./transfer/transfer";
import { managementCanister } from 'azle/canisters/management';
import {DAO_TREASURY} from "./constants";

let timerId: Opt<TimerId> = null;

$query
export function pastProposals(): Vec<ProposalViewResponse> {
    const proposals = state.proposals.values();
    const view: Vec<ProposalViewResponse> = [];

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

$query
export function activeProposal(): ActiveProposal {
    if (!state.proposal) {
        return {
            Err: "No active proposal"
        }
    }
    const proposal = state.proposal;
    const view: ProposalViewResponse = {
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

    }

    return {
        Ok: view
    }
}

$query

export function voteStatus(): VoteStatusResponse {
    if (!state.proposal) {
        return {
            Err: "No active proposal"
        }
    }

    const voteStatus: VoteStatus = {
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
    return {Ok: voteStatus};
}

$update;

export function createProposal(account: Account,
                               description: string,
                               title: string,
                               receiver: Account,
                               amount: nat64,
                               proposalType: ProposalType): ProposalResponse {

    if (account.owner === ic.caller()) {
        return {
            Err: {
                AccessDenied: null
            }
        }
    }

    if (state.proposal !== null) {
        return {
            Err: {ExistingProposal: null}
        }
    }

    const transferArgs: TransferArgs = {
        amount: state.proposalCost,
        created_at_time: null,
        fee: null,
        from_subaccount: null,
        memo: null,
        to: DAO_TREASURY
    };
    const balance = balance_of(account)
    if (balance < state.proposalCost) {
        return {
            Err: {
                InsufficientFunds: {balance}
            }
        }
    }

    handle_burn(transferArgs, account);

    const endTime = ic.time() + BigInt(state.duration * 1e8);
    const proposal: Proposal = {
        id: state.proposalCount,
        title,
        proposer: account,
        description,
        executed: false,
        votes: {},
        proposalType,
        endTime,
        amount: amount,
        receiver: receiver,
        error: null,
        ended: false
    };
    state.proposalCount++;

    state.proposal = proposal;
    state.proposals.set(proposal.id, proposal);

    return {Ok: proposal.id};
}

$update;

export function vote(account: Account, proposalId: nat, voteAmount: nat64, direction: boolean): ProposalResponse {
    if (account.owner === ic.caller()) {
        return {
            Err: {
                AccessDenied: null
            }
        }
    }

    const proposal = state.proposals.get(proposalId);
    if (!proposal) {
        return {
            Err: {
                ProposalNotFound: null
            }
        }
    }
    if (proposal.endTime < BigInt(Date.now())) {
        return {
            Err: {
                VotingPeriodEnded: null
            }
        }
    }

    const balance = balance_of(account)
    if (balance <= voteAmount) {
        return {
            Err: {
                InsufficientFunds: {balance}
            }
        }
    }
    const voter = account.owner;
    const mintingAccount: Account = {
        subaccount: null,
        owner: ic.id()
    };
    const voteProposal = proposal.votes[voter.toText()];
    const vote: Vote = voteProposal ? voteProposal : {
        voter,
        voteYes: 0n,
        voteNo: 0n
    };

    if (direction) {
        vote.voteYes += voteAmount;
    } else {
        vote.voteNo += voteAmount;
    }

    proposal.votes[voter.toText()] = vote;

    const transferArgs: TransferArgs = {
        amount: voteAmount,
        created_at_time: null,
        fee: null,
        from_subaccount: null,
        memo: null,
        to: mintingAccount
    };

    handle_burn(transferArgs, account);

    return {Ok: proposalId};
}

$update;
export function clearTimer(): void {
    if (timerId) {
        ic.clearTimer(timerId as bigint);
        timerId = null;
    }
    console.log(`timer ${timerId} cancelled`);
}

$update;
export function startTimer(): TimerId {
    if (timerId) {
        console.log("this is happening");
        ic.trap("timer already exists");
    }
    console.log("this is happening", timerId);


    timerId = ic.setTimerInterval(
        60n,
        _executeProposal
    );

    return timerId;
}

async function _executeProposal(): Promise<void> {

    const proposal = state.proposal;
    if (!proposal) {
        ic.trap("proposal none existent");
        return;
    }

    if (proposal.endTime >= ic.time()) {
        proposal.error = {
                VotingOngoing: null
            }
        state.proposals.set(proposal?.id, proposal);
        ic.trap("Voting Ongoing");
        return;
    }

    if (proposal.executed) {
        proposal.error = {
            AlreadyExecuted: null
        }
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
            const transferArgs: TransferArgs = {
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
    }
    proposal.ended = true;
    state.proposals.set(proposal?.id, proposal);
    state.proposal = null;
}