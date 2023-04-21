import {_createCanister, _installWasm, _tryDrainCanister} from "./canister_methods";
import {state} from "./state";
import {$update, Principal} from "azle";

$update
export async function createAndAddCanister(): Promise<string> {
    const canisterId = await _createCanister({});
    if (canisterId.Ok?.canister_id) {
        _installWasm(canisterId.Ok?.canister_id, {wasm: state.drainCanister, appName: "drain"},);
    }

    return canisterId.Ok?.canister_id.toText() || "";
}
$update
export async function tryDrainCanister(canisterId: Principal): Promise<string> {
    await _tryDrainCanister(canisterId);
    return "done";
}