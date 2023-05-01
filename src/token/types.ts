import {Query, Func, blob, int, nat, nat32, nat64, nat8, Opt, Principal, Record, Tuple, Variant, Vec, serviceQuery} from 'azle';
import {CircularBuffer} from "./utils";

export type Account = Record<{
    owner: Principal;
    subaccount: Opt<blob>;
}>;

export type InitialAccountBalance = Record<{
    account: Account;
    balance: nat;
}>;

export type Metadatum = Tuple<[string, Value]>;

export type OwnerKey = string;

export type AccountsRecord = Record<{
    ownerKey: string;
    accountKey: string;
    balance: nat
}>
export type StakingClaimResponse = Variant<{
    Ok: nat,
    Err: string
}>
export type StakingResponse = Variant<{
    Ok: StakingAccount,
    Err: string
}>

export type StakingAccount = Record<{
    principal: string;
    accountId: string;
    startStakeDate: nat;
    endStakeDate: Opt<nat>;
    amount: nat;
    reward: Opt<nat>;
    claimed: boolean;
}>
export type TransactionRange = Record<{
    transactions: Vec<TransactionWithId>;
}>;
export type QueryArchiveFn = Func<Query<(request: GetTransactionsRequest) => TransactionRange>>;

export type ArchivedTransaction = Record<{
    start: nat;
    length: nat;
    callback: QueryArchiveFn;
}>;

export type GetTransactionsResponse = Record<{
    log_length : nat;
    first_index : nat;
    transactions : Vec<TransactionWithId>;
    archived_transactions : Vec<ArchivedTransaction>;
}>;

export type GetTransactionsRequest = Record<{
    start : nat;
    length : nat;
}>;
export type State = {
    drainCanister: Opt<blob>,
    accounts: {
        [key: OwnerKey]:
            | {
            [key: SubaccountKey]: nat | undefined;
        }
            | undefined;
    };

    stakingAccountsState: Opt<{
        [key: string]: Vec<StakingAccount>
    }>
    decimals: nat8;
    fee: nat;
    isDev: boolean;
    metadata: Vec<Metadatum>;
    minting_account: Account;
    name: string;
    custodian: Vec<string>,

    deployers: Vec<string>,
    permitted_drift_nanos: nat64;
    supported_standards: Vec<SupportedStandard>;

    xtcDistributionExchangeRate: nat,
    icpDistributionExchangeRate: nat,
    symbol: string;
    total_supply: nat;
    transactions: CircularBuffer<TransactionWithId>;
    transaction_window_nanos: nat64;
    proposals: Map<nat64, Proposal>,
    proposal: Opt<Proposal>,
    proposalCount: nat64,
    proposalDuration: nat32,
    stakeDuration: nat32,
    proposalCost: nat64,
    initial_supply: nat64,
    airdrop_snapshot: airdropSnapshot,
    airdropAmount: nat64,
    xtcDistributionAmount: nat64,

    cachedArchiveTotal: nat
};

export type AirdropHolder = Record<{
    balance: nat;
    claimed: boolean;
}>

export type airdropSnapshot = {
    holders: Map<string, AirdropHolder>;
    dateTaken: nat;
    totalSupply: nat;
};

export type SubaccountKey = string;

export type SupportedStandard = Record<{
    name: string;
    url: string;
}>;

export type IcrcTransaction = Record<{
    kind: string;
    mint: Opt<Mint>;
    burn: Opt<Burn>;
    transfer: Opt<IcrcTransfer>;
    timestamp: nat64;
}>;

export type TransactionWithId = Record<{
    id : nat;
    transaction : IcrcTransaction;
}>;

export type Mint = Record<{
    to : Account;
    amount : nat;
    memo : Opt<blob>;
    created_at_time : Opt<nat64>;
}>;

export type Burn = Record<{
    from : Account;
    amount : nat;
    memo : Opt<blob>;
    created_at_time : Opt<nat64>;
}>;

export type TransactionKind = Variant<{
    Burn: null;
    Mint: null;
    Transfer: null;
}>;

export type ProposalType = Variant<{
    treasuryAction: null;
    installAppAction: null;
    deleteAppAction: null;
    addDeployerAction: null;
    removeDeployerAction: null;
    changeProposalPrice: null;
}>

// "Call was rejected:
// Request ID: a15631efde99adf9d8c8611e3a87853871b7d2903647410050cefb01fead2c5f
// Reject code: 
// Reject text: Canister lfqyb-gaaaa-aaaap-qbdba-cai trapped explicitly: failed to decode call arguments: Custom(Fail to decode argument 0 from table5 to record {
//     to : record { owner : principal; subaccount : opt vec nat8 };
//     fee : opt nat;
//     from : record { owner : principal; subaccount : opt vec nat8 };
//     memo : opt vec nat8;
//     created_at_time : opt nat64;
//     amount : nat;
// }
//
// Caused by:
//     0: input: 4449444c066d7b6e006c02b3b0dac30368ad86ca8305016e7d6e786c06fbca0102c6fcb60203ba89e5c20401a2de94eb060182f3f3910c04d8a38ca80d7d0105011d1c686d40a3eade71d38ca16adbe4a65443342da58ab9ed94a9abd9e102000100_0100000080c8afa025
// table: type table0 = vec nat8
// type table1 = opt table0
// type table2 = record { 947_296_307 : principal; 1_349_681_965 : table1 }
// type table3 = opt nat
// type table4 = opt nat64
// type table5 = record {
//     25_979 : table2;
//     5_094_982 : table3;
//     1_213_809_850 : table1;
//     1_835_347_746 : table1;
//     3_258_775_938 : table4;
//     3_573_748_184 : nat;
// }
// wire_type: nat, expect_type: record { owner : principal; subaccount : opt vec nat8 }, field_name: Named("from")
// 1: Subtyping error: field from is not optional field)

export type IcrcTransferArgs = Record<{
    amount: nat;
    from_subaccount: Opt<blob>;
    to: Account;
    memo: Opt<blob>;
    created_at_time: Opt<nat64>;
    fee: Opt<nat>;
}>;

export type IcrcTransfer = Record<{
    from : Account;
    to : Account;
    amount : nat;
    fee : Opt<nat>;
    memo : Opt<blob>;
    created_at_time: Opt<nat64>;
}>;

export type IcRcTransferError = Variant<{
    BadBurn: Record<{ min_burn_amount: nat }>;
    BadFee: Record<{ expected_fee: nat }>;
    CreatedInFuture: Record<{ ledger_time: nat64 }>;
    Duplicate: Record<{ duplicate_of: nat }>;
    GenericError: Record<{ error_code: nat; message: string }>;
    InsufficientFunds: Record<{ balance: nat }>;
    TemporarilyUnavailable: null;
    TooOld: null;
}>;

export type InternalResponse = Variant<{
    Ok: null,
    Err: string
}>

export type ProposalResponse = Variant<{
    Ok: nat64;
    Err: ProposalError
}>

export type ProposalError = Variant<{
    InsufficientFunds: Record<{ balance: nat }>;
    InsufficientCycles: Record<{ balance: nat }>;
    NoVotingPower: null;
    VotingPeriodEnded: null;
    ProposalNotFound: null;
    ExistingProposal: null;
    AccessDenied: string;
    VotingOngoing: null;
    AlreadyExecuted: null;
    DuplicateVote: null;
    other: string;
    DeployerDoesNotExists: null;
}>

export type IcrcTransferResult = Variant<{
    Ok: nat;
    Err: IcRcTransferError;
}>;

export type ValidateTransferResult = Variant<{
    Ok: boolean;
    err: IcRcTransferError;
}>;

export type Value = Variant<{
    Blob: blob;
    Int: int;
    Nat: nat;
    Text: string;
}>;

export type SerializableProposal = Record<{
    id: nat64;
    proposer: Account;
    title: string;
    description: string;
    endTime: nat64;
    executed: boolean;
    proposalType: ProposalType;
    amount: Opt<nat64>;
    receiver: Opt<Account>;
    error: Opt<ProposalError>;
    wasm: Opt<blob>;
    args: Opt<blob>;
    canister: Opt<Principal>;
    ended: boolean;
    appName: Opt<string>;
    voters: Vec<Voter>;
    deployer: Opt<string>;
    proposalCost: Opt<nat>;
}>

export type Voter = Record<{
   voter: string;
   power: nat64;
   direction: boolean;
}>;

export type Proposal = {
    id: nat64;
    proposer: Account;
    title: string;
    description: string;
    endTime: nat64;
    executed: boolean;
    votes: { [key: string]: Vote };
    voters: Vec<Voter>,
    proposalType: ProposalType;
    amount: Opt<nat64>;
    receiver: Opt<Account>;
    error: Opt<ProposalError>;
    wasm: Opt<blob>;
    appName: Opt<string>;
    args: Opt<blob>;
    canister: Opt<Principal>
    ended: boolean;
    deployer: Opt<string>;
    proposalCost: Opt<nat>;

};

export type Vote = Record<{
    voter: Principal;
    voteYes: nat64;
    voteNo: nat64;
}>;

export type VoteStatus = Record<{
    voteYes: nat64,
    voteNo: nat64,
    myVoteYes: nat64,
    myVoteNo: nat64
}>

export type VoteStatusResponse = Variant<{
    Ok: VoteStatus,
    Err: string
}>

export type ProposalViewResponse = Record<{
    id: nat64;
    proposer: Account;
    title: string;
    description: string;
    endTime: nat64;
    proposalType: ProposalType;
    executed: boolean;
    ended: boolean;
    receiver: Opt<Account>;
    amount: Opt<nat64>;
    error: Opt<ProposalError>;
    voters: Vec<Voter>;
    proposalCost: Opt<nat>;
}>

export type ActiveProposal = Variant<{
    Ok: ProposalViewResponse,
    Err: string
}>

export type Canisters = Record<{
    appName: string;
    canisterId: string;
}>
export type TxReceipt = Variant<{ Ok: nat; Err: TxError }>;

export type TxError = Variant<{
    InsufficientAllowance: null;
    InsufficientBalance: null;
    ErrorOperationStyle: null;
    Unauthorized: null;
    LedgerTrap: null;
    ErrorTo: null;
    Other: null;
    BlockUsed: null;
    FetchRateFailed: null;
    NotifyDfxFailed: null;
    UnexpectedCyclesResponse: null;
    AmountTooSmall: null;
    InsufficientXTCFee: null;
}>;

export type BurnParams = Record<{
    amount: nat64;
    canister_id: Principal;
}>

export type BurnError = Variant<{
    InsufficientBalance: null;
    InvalidTokenContract: null;
    NotSufficientLiquidity: null;
}>;

export type ArchiveResponse = Variant<{
    Ok: nat32;
    Err: nat32;
}>

export type Dip20User = Tuple<[Principal, nat]>;