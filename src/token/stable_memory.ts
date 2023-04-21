import {blob, StableBTreeMap, Vec} from "azle";
import {AccountsRecord, SerializableProposal, Transaction, Vote} from "./types";

export let stableAccounts = new StableBTreeMap<string, AccountsRecord>(0, 100, 200);
export let stableTransactions = new StableBTreeMap<string, Transaction>(1, 100, 500);
export let stableProposals = new StableBTreeMap<string, SerializableProposal>(2, 100, 5000);
export let stableProposalVotes = new StableBTreeMap<string, Vec<Vote>>(3, 100, 200);
export let stableCanisterRegister = new StableBTreeMap<string, string>(4, 100, 100);
export let stableIds = new StableBTreeMap<string, string>(5, 100, 100);