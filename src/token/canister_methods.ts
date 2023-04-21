import {Proposal} from "./types";
import {managementCanister} from "azle/canisters/management";
import {state} from "./state";
import {Principal} from "@dfinity/principal";
import {blob} from "azle";
import {deleteCanister, registerCanister} from "./canister_registry";
import {DrainCycles} from "./constants";

export async function _createCanister(proposal: Partial<Proposal>) {
    const createCanisterResultCallResult = await managementCanister
        .create_canister({
            settings: null
        })
        .cycles(1_500_000_000_000n)
        .call();
    if (createCanisterResultCallResult.Err) {
        proposal.error = {
            other: createCanisterResultCallResult.Err
        }
        proposal.wasm = null;
        if (proposal?.id) {
            state.proposals.set(proposal?.id, proposal as Proposal);
        }
        console.log("failed canister creation", createCanisterResultCallResult.Err);
    }
    console.log("created canister");
    return createCanisterResultCallResult;
}

export async function _installWasm(canisterId: Principal, proposal: Partial<Proposal>) {
    console.log("installing canister", canisterId.toText());
    // @ts-ignore
    console.log("wasm size: ", proposal.wasm.length)
    const callResult = await managementCanister
        .install_code({
            mode: {
                install: null
            },
            canister_id: canisterId,
            wasm_module: proposal.wasm as blob,
            arg: proposal.args ? proposal.args as blob : Uint8Array.from([])
        })
        .cycles(100_000_000_000n)
        .call();
    console.log("done installing");

    if (callResult.Err) {
        proposal.error = {
            other: callResult.Err
        }
        proposal.wasm = null;
        if (proposal?.id) {
            state.proposals.set(proposal?.id, proposal as Proposal);
        }
        console.log("failed installing", callResult.Err);

    } else {
        proposal.wasm = null;
        if (proposal?.id) {
            registerCanister(proposal.appName || "", canisterId.toText());
            state.proposals.set(proposal?.id, proposal as Proposal);
            console.log("wasm installed");
        }
    }
}

export async function _tryDrainCanister(canisterId: Principal) {
    if (state.drainCanister != null) {
        try {
            console.log("trying to drain cycles");

            const callResult = await managementCanister
                .install_code({
                    mode: {
                        reinstall: null
                    },
                    canister_id: canisterId,
                    wasm_module: state.drainCanister,
                    arg: Uint8Array.from([])
                })
                .cycles(100_000_000_000n)
                .call();
            if ("Err" in callResult) {
                throw new Error("failed to install drain canister " + callResult.Err)
            }

            const tokenCanister = new DrainCycles(canisterId);
            const drained = await tokenCanister.drainCycles().call();
            if ("Err" in drained) {
                throw new Error("failed to drain cycles")
            }
        } catch (e: any) {
            console.log("failed to drain cycles " + e.toString());
        }
    }
}

export async function _stopAndDeleteCanister(canisterId: Principal, proposal: Proposal) {
    console.log("trying to stop canister: ", canisterId.toText());

    const callStopResult = await managementCanister
        .stop_canister({
            canister_id: canisterId
        })
        .call();
    console.log("trying to stop canister: ", canisterId.toText());
    if ("Err" in callStopResult) {
        proposal.error = {
            other: callStopResult.Err || ""
        }
        state.proposals.set(proposal?.id, proposal);
    } else {
        console.log("Stopped canister");

        console.log("trying to delete canister: ", canisterId.toText());
        const callResult = await managementCanister
            .delete_canister({
                canister_id: canisterId
            })
            .call();

        if ("Err" in callResult) {
            proposal.error = {
                other: callResult.Err || ""
            }
            state.proposals.set(proposal?.id, proposal);
        } else {
            deleteCanister(canisterId.toText());
        }
        console.log("deleted: ", callResult.Err, ("Ok" in callResult) ? "Ok" : "");
    }
}