import {InternalResponse, Proposal} from "./types";
import {managementCanister} from "azle/canisters/management";
import {state} from "./state";
import {blob, Principal} from "azle";
import {DrainCycles} from "./constants";

export async function _createCanister(proposal: Partial<Proposal>) {
    const createCanisterResultCallResult = await managementCanister
        .create_canister({
            settings: null
        })
        .cycles(3_000_000_000_000n)
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

export async function _installWasm(canisterId: Principal, proposal: Partial<Proposal>): Promise<InternalResponse>  {
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
        return {Err: callResult.Err};

    } else {
        proposal.wasm = null;
        return {Ok: null};
    }
}

export async function _tryDrainCanister(canisterId: Principal): Promise<InternalResponse> {
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
                return {Err: `failed to install drain canister ${callResult.Err}`}
            }

            const tokenCanister = new DrainCycles(canisterId);
            const drained = await tokenCanister.drainCycles().call();
            if ("Err" in drained) {
                return {Err: `failed to drain cycles ${drained.Err}`}
            }
        } catch (e: any) {
            return {Err: `failed to drain cycles ${e.toString()}`}
        }
        return {Ok: null};
    }
    return {Err: "no drain canister"};
}

export async function _stopAndDeleteCanister(canisterId: Principal): Promise<InternalResponse> {
    console.log("trying to stop canister: ", canisterId.toText());

    const callStopResult = await managementCanister
        .stop_canister({
            canister_id: canisterId
        })
        .call();
    console.log("trying to stop canister: ", canisterId.toText());
    if ("Err" in callStopResult) {
        return {Err: callStopResult.Err || ""};
    } else {
        console.log("Stopped canister");

        console.log("trying to delete canister: ", canisterId.toText());
        const callResult = await managementCanister
            .delete_canister({
                canister_id: canisterId
            })
            .call();

        if ("Err" in callResult) {
            return {Err: callResult.Err || ""};
        }
        return {Ok: null};
    }
}