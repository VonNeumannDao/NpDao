import {blob, StableBTreeMap, Vec} from "azle";
import {AccountsRecord, SerializableProposal, StakingAccount, IcrcTransaction, TransactionWithId} from "./types";

export let stableAccounts = new StableBTreeMap<number, Vec<AccountsRecord>>(0, 100, 5000000);
export let stableTransactions = new StableBTreeMap<number, Vec<TransactionWithId>>(1, 100, 600000);
export let stableProposals = new StableBTreeMap<number, Vec<SerializableProposal>>(2, 100, 150000000);
export let stableCanisterRegister = new StableBTreeMap<string, string>(4, 100, 100);
export let stableIds = new StableBTreeMap<string, string>(5, 100, 100);
export let stableMemory = new StableBTreeMap<string, blob>(6, 100, 5000000);
export let stableStakingAccounts = new StableBTreeMap<number, Vec<StakingAccount>>(7, 100, 150000000);
export let stableQueuedTransactions = new StableBTreeMap<string, TransactionWithId>(8, 100, 500);