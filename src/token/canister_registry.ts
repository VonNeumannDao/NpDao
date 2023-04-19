import {$query, Vec} from 'azle';

import {Canisters} from './types';
import {stableCanisterRegister} from "./stable_memory";

$query;

export function canisters(): Vec<Canisters> {
    const canisters: Canisters[] = [];
    for (let keyname of stableCanisterRegister.keys()) {
        canisters.push({
            ratifiedDate: stableCanisterRegister.get(keyname) as string,
            canisterId: keyname
        })
    }

    return canisters;
}

export function registerCanister(ratifiedDate: string, canisterId: string): void {
    stableCanisterRegister.insert(canisterId, ratifiedDate);
}