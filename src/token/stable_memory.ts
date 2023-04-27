import {blob, StableBTreeMap, Vec} from "azle";
import {AccountsRecord, SerializableProposal, StakingAccount, IcrcTransaction, Vote} from "./types";

export let stableAccounts = new StableBTreeMap<string, AccountsRecord>(0, 100, 200);
export let stableTransactions = new StableBTreeMap<number, IcrcTransaction>(1, 100, 500);
export let stableProposals = new StableBTreeMap<string, SerializableProposal>(2, 100, 1000000);
export let stableCanisterRegister = new StableBTreeMap<string, string>(4, 100, 100);
export let stableIds = new StableBTreeMap<string, string>(5, 100, 100);
export let stableMemory = new StableBTreeMap<string, blob>(6, 100, 5000000);
export let stableStakingAccounts = new StableBTreeMap<number, StakingAccount>(7, 100, 256);
export let stableArchivedTransactions = new StableBTreeMap<string, IcrcTransaction>(8, 300, 500);