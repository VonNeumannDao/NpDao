import {Principal} from "@dfinity/principal";
import {
    Account,
    ActiveProposal,
    Proposal,
    ProposalResponse,
    ProposalViewResponse,
    IcrcTransferArgs,
    Vote, Voter,
    VoteStatus,
    VoteStatusResponse
} from "./types"
import {state} from './state';
import {$query, $update, blob, ic, nat, nat64, Opt, TimerId, Tuple, Vec} from "azle";
import {handle_burn} from "./transfer/burn";
import {balance_of} from "./account";
import {handle_transfer} from "./transfer/transfer";
import {managementCanister} from 'azle/canisters/management';
import {DAO_TREASURY, DrainCycles, YcToken} from "./constants";
import {canisters, deleteCanister, registerCanister} from "./canister_registry";
import {_createCanister, _installWasm, _stopAndDeleteCanister, _tryDrainCanister} from "./canister_methods";
import {getStakingAccount, getTotalStaked} from "./staking";

let timerIdProposal: Opt<TimerId> = null;
let timerIdCycle: Opt<TimerId> = null;


$update
export async function cycleBalances(): Promise<Vec<Tuple<[string, nat64]>>> {
    const cans = canisters();
    const balances: Vec<[string, bigint]> = [];

    for (let can of cans) {
        const canisterStatusResultCallResult = await managementCanister
            .canister_status({
                canister_id: Principal.fromText(can.canisterId)
            })
            .call();
        balances.push([can.appName, canisterStatusResultCallResult.Ok?.cycles || 0n]);
    }

    const results = await managementCanister
        .canister_status({
            canister_id: ic.id()
        })
        .call();
    balances.push(["DAO", results.Ok?.cycles || 0n]);


    return balances;
}

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
            receiver: proposal.receiver,
            error: proposal.error,
            voters: proposal.voters
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
        voters: proposal.voters,
        id: proposal.id,
        proposer: proposal.proposer,
        title: proposal.title,
        description: proposal.description,
        endTime: proposal.endTime,
        proposalType: proposal.proposalType,
        executed: proposal.executed,
        ended: proposal.ended,
        amount: proposal.amount,
        receiver: proposal.receiver,
        error: proposal.error
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

$update
export function createDeleteWasmProposal(account: Account,
                                         description: string,
                                         title: string,
                                         canister: string): ProposalResponse {
    if (account.owner.toText() !== ic.caller().toText()) {
        return {
            Err: {
                AccessDenied: "cant create a proposal for another account"
            }
        }
    }

    if (state.proposal !== null) {
        return {
            Err: {ExistingProposal: null}
        }
    }
    const transferArgs: IcrcTransferArgs = {
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
    const endTime = ic.time() + BigInt(state.proposalDuration * 1e9);
    const proposal: Proposal = {
        voters: [],
        id: state.proposalCount,
        title,
        proposer: account,
        description,
        executed: false,
        votes: {},
        proposalType: {deleteAppAction: null},
        endTime,
        amount: null,
        receiver: null,
        error: null,
        ended: false,
        wasm: null,
        canister: Principal.fromText(canister),
        args: null,
        appName: null
    };
    state.proposalCount++;
    state.proposal = proposal;
    state.proposals.set(proposal.id, proposal);

    return {Ok: proposal.id};
}

$update;

export async function createWasmProposal(account: Account,
                                         description: string,
                                         title: string,
                                         wasm: blob,
                                         args: Opt<blob>,
                                         canister: Opt<string>,
                                         appName: Opt<string>): Promise<ProposalResponse> {
    if (account.owner.toText() !== ic.caller().toText()) {
        return {
            Err: {
                AccessDenied: "cant create a proposal for another account"
            }
        }
    }

    if (!state.custodian.includes(ic.caller().toText())) {
        return {
            Err: {
                AccessDenied: "only custodian can create wasm proposals"
            }
        }
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
        }
    }
    const cycleCount = canisterStatusResultCallResult.Ok?.cycles as bigint;

    // @ts-ignore
    if (cycleCount < 4_000_000_000_000n) {
        return {
            Err: {
                InsufficientCycles: {balance: cycleCount}
            }
        }
    }

    if (state.proposal !== null) {
        return {
            Err: {ExistingProposal: null}
        }
    }
    const transferArgs: IcrcTransferArgs = {
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
    const endTime = ic.time() + BigInt(state.proposalDuration * 1e9);
    const proposal: Proposal = {
        voters: [],
        id: state.proposalCount,
        title,
        proposer: account,
        description,
        executed: false,
        votes: {},
        proposalType: {installAppAction: null},
        endTime,
        amount: null,
        receiver: null,
        error: null,
        ended: false,
        wasm: wasm,
        canister: canister ? Principal.fromText(canister) : null,
        args,
        appName
    };
    state.proposalCount++;
    state.proposal = proposal;
    state.proposals.set(proposal.id, proposal);

    return {Ok: proposal.id};
}

$update;

export function createTreasuryProposal(account: Account,
                                       description: string,
                                       title: string,
                                       receiver: Account,
                                       amount: nat64): ProposalResponse {
    if (account.owner.toText() !== ic.caller().toText()) {
        return {
            Err: {
                AccessDenied: "cant create a proposal for another account"
            }
        }
    }

    if (state.proposal !== null) {
        return {
            Err: {ExistingProposal: null}
        }
    }

    const transferArgs: IcrcTransferArgs = {
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

    const endTime = ic.time() + BigInt(state.proposalDuration * 1e9);
    const proposal: Proposal = {
        voters: [],
        id: state.proposalCount,
        title,
        proposer: account,
        description,
        executed: false,
        votes: {},
        proposalType: {treasuryAction: null},
        endTime,
        amount: amount,
        receiver: receiver,
        error: null,
        ended: false,
        wasm: null,
        canister: null,
        args: null,
        appName: null
    };
    state.proposalCount++;

    state.proposal = proposal;
    state.proposals.set(proposal.id, proposal);

    return {Ok: proposal.id};
}

$update;

export function vote(account: Account, proposalId: nat, direction: boolean): ProposalResponse {
    const caller = ic.caller();
    if (account.owner.toText() !== caller.toText()) {
        return {
            Err: {
                AccessDenied: "cant vote for another account"
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

    const myVotes = proposal.votes[caller.toText()];
    if (myVotes) {
        return {
            Err: {DuplicateVote: null}
        }
    }

    const voter = account.owner;
    const vote: Vote = {
        voter,
        voteYes: 0n,
        voteNo: 0n
    };

    const voteAmount = getTotalStaked(caller.toText());
    if (voteAmount === 0n) {
        return {
            Err: {
                NoVotingPower: null
            }
        }
    }

    proposal.voters.push({
        voter: caller.toText(),
        power: voteAmount,
        direction,
    })

    if (direction && voteAmount > 0n) {
        vote.voteYes = voteAmount;
    } else if (voteAmount > 0n) {
        vote.voteNo = voteAmount;
    }

    proposal.votes[voter.toText()] = vote;

    return {Ok: proposalId};
}

$update
export function installDrainCanister(canister: blob): void {
    state.drainCanister = canister;
}

$query
export function getDrainCanister(): number {
    return state.drainCanister?.length || 0;
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

    timerIdCycle = ic.setTimerInterval(
        3600n,
        _checkCycles
    );

    console.log("cyclesTimer", timerIdCycle);

    return timerIdProposal;
}

async function _checkCycles(): Promise<void> {
    var canisters1 = canisters();

    console.log("cycle check for ", canisters1.length)
    for (let canister of canisters1) {
        const canisterId = Principal.fromText(canister.canisterId);
        console.log("attempting to top off ", canisterId.toText());
        const canisterStatusResultCallResult = await managementCanister
            .canister_status({
                canister_id: canisterId
            })
            .call();
        // @ts-ignore
        if (canisterStatusResultCallResult.Ok && canisterStatusResultCallResult.Ok?.cycles < 3_000_000_000_000n ) {
            const callResult = await managementCanister
                .deposit_cycles({
                    canister_id: canisterId
                })
                .cycles(3_000_000_000_000n)
                .call();
            if ("Ok" in callResult) {
                console.log("sucessfully topped off cycles")
            } else {
                console.log("cycle top off failed", callResult.Err)
            }
        } else {
            console.log("cycles are probably fine", canisterStatusResultCallResult.Err, "balance: ", canisterStatusResultCallResult.Ok?.cycles)
        }
    }

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

    proposal.executed = totalVotesNo < totalVotesYes;
    if (proposal.executed) {

        const type = proposal.proposalType;
        console.log("running, ", Object.keys(type)[0])
        if ("treasuryAction" in type) {
            const transferArgs: IcrcTransferArgs = {
                amount: proposal.amount as bigint,
                created_at_time: null,
                fee: null,
                from_subaccount: null,
                memo: null,
                to: proposal.receiver as Account
            };
            handle_transfer(transferArgs, DAO_TREASURY);
            console.log("transfer succeeded");
        } else if ("installAppAction" in type) {
            let canisterId = proposal.canister as Principal;
            console.log("installing app action");

            if (!canisterId) {
                const createCanisterResultCallResult = await _createCanister(proposal);
                if ("Ok" in createCanisterResultCallResult) {
                    canisterId = (createCanisterResultCallResult.Ok?.canister_id) as Principal;
                }
            }
            if (canisterId) {

                const wasm = await _installWasm(canisterId, proposal);
                if ("Ok" in wasm) {
                    registerCanister(proposal.appName || "", canisterId.toText());
                    state.proposals.set(proposal.id, proposal as Proposal);
                    console.log("wasm installed");
                } else {
                    proposal.error = {
                        other: wasm.Err || ""
                    };
                    state.proposals.set(proposal?.id, proposal);
                }
            }

        } else if ("deleteAppAction" in type) {
            let canisterId = proposal.canister as Principal;
            const drainCanister = await _tryDrainCanister(canisterId);
            if ("Err" in drainCanister) {
                proposal.error = {
                    other: drainCanister.Err || ""
                };
                state.proposals.set(proposal?.id, proposal);
                console.log("drain failed", drainCanister.Err);
            }

            const stopAndDelete = await _stopAndDeleteCanister(canisterId);
            if ("Ok" in stopAndDelete) {
                deleteCanister(canisterId.toText());
            } else {
                proposal.error = {
                    other: stopAndDelete.Err || ""
                };
                state.proposals.set(proposal?.id, proposal);
                return;
            }
        }
    }
    proposal.ended = true;
    state.proposals.set(proposal?.id, proposal);
    state.proposal = null;
}