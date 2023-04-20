import {$query, Vec} from 'azle';

import {Canisters} from './types';
import {stableCanisterRegister} from "./stable_memory";

$query;
export function canisters(): Vec<Canisters> {
    const canisters: Canisters[] = [];
    for (let keyname of stableCanisterRegister.keys()) {
        canisters.push({
            appName: stableCanisterRegister.get(keyname) as string,
            canisterId: keyname
        })
    }

    return canisters;
}

export function registerCanister(appName: string, canisterId: string): void {
    stableCanisterRegister.insert(canisterId, appName);
}

export function deleteCanister(canisterId: string): void {
    stableCanisterRegister.remove(canisterId);
}