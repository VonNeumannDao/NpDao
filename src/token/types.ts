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
    memo: string;
    claimed: boolean;
}>
export type TransactionRange = Record<{
    transactions: Vec<IcrcTransaction>;
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
    transactions : Vec<IcrcTransaction>;
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
    metadata: Vec<Metadatum>;
    minting_account: Opt<Account>;
    name: string;
    custodian: Vec<string>,
    permitted_drift_nanos: nat64;
    supported_standards: Vec<SupportedStandard>;

    xtcDistributionExchangeRate: nat,
    icpDistributionExchangeRate: nat,
    symbol: string;
    total_supply: nat;
    transactions: CircularBuffer<IcrcTransaction>;
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
};

export type airdropSnapshot = {
    holders: Map<string, nat>;
    dateTaken: nat;
    totalSupply: nat;
};

export type SubaccountKey = string;

export type SupportedStandard = Record<{
    name: string;
    url: string;
}>;

export type IcrcTransaction = Record<{
    args: Opt<IcrcTransferArgs>;
    fee: nat;
    from: Opt<Account>;
    kind: TransactionKind;
    timestamp: nat64;
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
}>

export type IcrcTransferArgs = Record<{
    amount: nat;
    created_at_time: Opt<nat64>;
    fee: Opt<nat>;
    from_subaccount: Opt<blob>;
    memo: Opt<blob>;
    to: Account;
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