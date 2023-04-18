import {ic, Opt, $init, $preUpgrade, $postUpgrade, StableBTreeMap, Vec, Principal, nat64, $query, nat} from 'azle';
import { state } from './state';
import { handle_mint } from './transfer/mint';
import { is_subaccount_valid, stringify } from './transfer/validate';

import {
    Account, AccountsRecord,
    InitialAccountBalance, Vote, SerializableProposal, Transaction,
    TransferArgs, Proposal, Canisters
} from './types';
import {DAO_TREASURY, MINTING_ACCOUNT} from "./constants";
import {balance_of} from "./account";
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