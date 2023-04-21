import {Proposal, State} from './types';
import {nat64} from "azle";
import config from "../../cig-config.json"

export let state: State = {
    accounts: {},
    initial_supply: BigInt(config.initialSupply),
    decimals: config.decimal,
    fee: BigInt(config.fee),
    drainCanister: null,
    metadata: [
        ['icrc1:decimals', {Nat: BigInt(config.decimal)}],
        ['icrc1:fee', {Nat: BigInt(config.fee)}],
        ['icrc1:name', {Text: config.name}],
        ['icrc1:symbol', {Text: config.symbol}]
    ],
    minting_account: null,
    name: config.name,
    permitted_drift_nanos: 60_000_000_000n,
    supported_standards: [
        {
            name: 'ICRC-1',
            url: 'https://github.com/dfinity/ICRC-1'
        }
    ],
    symbol: config.symbol,
    total_supply: 0n,
    transactions: [],
    transaction_window_nanos: 24n * 60n * 60n * 1_000_000_000n,
    proposals: new Map<nat64, Proposal>(),
    proposalCount: 0n,
    duration: config.proposalDuration,
    proposal: null,
    proposalCost: BigInt(config.proposalCost),
    airdropAmount: BigInt(config.airdropAmount),
    tokenDistributionAmount: BigInt(config.tokenDistributionAmount),
    airdrop_snapshot: {
        holders: new Map<string, nat64>(),
        dateTaken: 0n,
        totalSupply: 0n
    }
};
