import {AirdropHolder, Proposal, StakingAccount, State, TransactionWithId} from './types';
import {nat64, Vec} from "azle";
import config from "../../cig-config.json"
import {CircularBuffer} from "./utils";
import {MAX_TRANSACTIONS_PER_REQUEST, MINTING_ACCOUNT} from "./constants";

export let state: State = {
    accounts: {},
    env: "dev",
    initial_supply: BigInt(config.initialSupply),
    decimals: config.decimal,
    fee: BigInt(config.fee),
    drainCanister: null,
    metadata: [
        ['icrc1:decimals', {Nat: BigInt(config.decimal)}],
        ['icrc1:fee', {Nat: BigInt(config.fee)}],
        ['icrc1:name', {Text: config.name}],
        ['icrc1:symbol', {Text: config.symbol}],
        ['icrc1:logo', {Text: config.logo}]
    ],
    minting_account: MINTING_ACCOUNT,
    name: config.name,
    permitted_drift_nanos: 3_000_000_000n,
    supported_standards: [
        {
            name: 'ICRC-1',
            url: 'https://github.com/dfinity/ICRC-1'
        }
    ],
    symbol: config.symbol,
    total_supply: 0n,
    transactions: new CircularBuffer<TransactionWithId>(Number(MAX_TRANSACTIONS_PER_REQUEST)),
    transaction_window_nanos: 24n * 60n * 60n * 1_000_000_000n,
    proposals: new Map<nat64, Proposal>(),
    proposalCount: 0n,
    proposalDuration: config.proposalDuration,
    activeProposals: [],
    proposalCost: BigInt(config.proposalCost),
    airdropAmount: BigInt(config.airdropAmount),
    xtcDistributionAmount: BigInt(config.distribution.xtc.amount),
    xtcDistributionExchangeRate: BigInt(config.distribution.xtc.exchangeRate),
    icpDistributionExchangeRate: BigInt(config.distribution.icp.exchangeRate),
    stakeDuration: config.stake.duration,
    stakingAccountsState: new Map<string, Vec<StakingAccount>>(),
    rewardsPercent: config.stake.rewardsPercent,
    custodian: config.custodian,
    deployers: config.deployers,
    airdrop_snapshot: {
        holders: new Map<string, AirdropHolder>(),
        dateTaken: 0n,
        totalSupply: 0n
    },
    cachedArchiveTotal: 0n
};
