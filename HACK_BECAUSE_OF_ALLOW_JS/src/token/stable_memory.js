import { StableBTreeMap } from "azle";
export let stableAccounts = new StableBTreeMap(0, 100, 200);
export let stableTransactions = new StableBTreeMap(1, 100, 500);
export let stableProposals = new StableBTreeMap(2, 100, 500);
export let stableProposalVotes = new StableBTreeMap(3, 100, 200);
export let stableCanisterRegister = new StableBTreeMap(4, 100, 100);
