import {_createCanister, _installWasm, _tryDrainCanister} from "./canister_methods";
import {state} from "./state";
import {$update, Principal, ic} from "azle";

$update
export async function createAndAddCanister(): Promise<string> {
    if (!state.custodian.includes(ic.caller().toText())) {
        return "not authorized";
    }

    const canisterId = await _createCanister({});
    if (canisterId.Ok?.canister_id) {
        _installWasm(canisterId.Ok?.canister_id, {wasm: state.drainCanister, appName: "drain"},);
    }

    return canisterId.Ok?.canister_id.toText() || "";
}
$update
export async function tryDrainCanister(canisterId: Principal): Promise<string> {
    if (!state.custodian.includes(ic.caller().toText())) {
        return "not authorized";
    }
    await _tryDrainCanister(canisterId);
    return "done";
}