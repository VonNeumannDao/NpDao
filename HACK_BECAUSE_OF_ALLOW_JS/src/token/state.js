import config from "../../cig-config.json";
export let state = {
    accounts: {},
    initial_supply: BigInt(config.initialSupply),
    decimals: config.decimal,
    fee: BigInt(config.fee),
    metadata: [
        ['icrc1:decimals', { Nat: BigInt(config.decimal) }],
        ['icrc1:fee', { Nat: BigInt(config.fee) }],
        ['icrc1:name', { Text: config.name }],
        ['icrc1:symbol', { Text: config.symbol }]
    ],
    minting_account: null,
    name: config.name,
    permitted_drift_nanos: 60000000000n,
    supported_standards: [
        {
            name: 'ICRC-1',
            url: 'https://github.com/dfinity/ICRC-1'
        }
    ],
    symbol: config.symbol,
    total_supply: 0n,
    transactions: [],
    transaction_window_nanos: 24n * 60n * 60n * 1000000000n,
    proposals: new Map(),
    proposalCount: 0n,
    duration: 120,
    proposal: null,
    proposalCost: 300000000n
};
