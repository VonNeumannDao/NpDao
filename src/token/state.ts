import {Proposal, State} from './types';
import {nat64} from "azle";

export let state: State = {
    accounts: {},
    decimals: 0,
    fee: 0n,
    metadata: [],
    minting_account: null,
    name: '',
    permitted_drift_nanos: 60_000_000_000n,
    supported_standards: [],
    symbol: '',
    total_supply: 0n,
    transactions: [],
    transaction_window_nanos: 24n * 60n * 60n * 1_000_000_000n,
    init_ran: false,
    proposals: new Map<nat64, Proposal>(),
    proposalCount: 0n,
    duration: 120,
    proposal: null,
    proposalCost: 3_00000000n
};
