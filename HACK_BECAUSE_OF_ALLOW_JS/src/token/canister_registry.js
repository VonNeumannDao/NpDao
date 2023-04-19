import { $query } from 'azle';
import { stableCanisterRegister } from "./stable_memory";
$query;
export function canisters() {
    const canisters = [];
    for (let keyname of stableCanisterRegister.keys()) {
        canisters.push({
            ratifiedDate: stableCanisterRegister.get(keyname),
            canisterId: keyname
        });
    }
    return canisters;
}
export function registerCanister(ratifiedDate, canisterId) {
    stableCanisterRegister.insert(canisterId, ratifiedDate);
}
