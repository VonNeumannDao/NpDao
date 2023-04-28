import {
    Account, ArchiveResponse,
    BurnError,
    BurnParams,
    GetTransactionsRequest,
    TransactionRange,
    TransactionWithId,
    TxReceipt
} from "./types";
import {CallResult, ic, nat, nat32, nat64, Opt, Principal, Service, Tuple, Variant, Vec} from "azle";
import {serviceQuery, serviceUpdate} from "azle/src/lib/candid_types/service";
import {hexToUint8Array} from "./utils";
import {state} from "./state";

export const MAX_TRANSACTIONS_PER_REQUEST = 1000n;

export const XTC_DISTRIBUTION_ACCOUNT: Account = {
    subaccount:
        hexToUint8Array("3fb3d3f31477a34a465b56f4e4d4a4a0fc8c58191e551c57e0447b0f16e56a7b")
    ,
    owner: ic.id()
};

export const ICP_DISTRIBUTION_ACCOUNT: Account = {
    subaccount:
        hexToUint8Array("3fb3d3f31477a34a465b56f4e4d4a4a0fc8c58191e551c57e0447b0f16e56a7b")
    ,
    owner: ic.id()
};

export const MINTING_ACCOUNT: Account = {
    subaccount:
        hexToUint8Array("5f7d5d5a537c29ac3bc371104db6c85a6a89c6d153a6a697a92b97b58d1e6af9")
    ,
    owner: ic.id()
};

export const AIRDROP_ACCOUNT: Account = {
    subaccount:
        hexToUint8Array("9e72b16d8b41a1040487a2ca72932f6e8f6f42d7147f2b9a703a0d4493d3db3\n")
    ,
    owner: ic.id()
};


export const DAO_TREASURY: Account = {
    subaccount: null,
    owner: ic.id()
};
export class XTCToken extends Service {
    @serviceUpdate
    transferFrom: (from: Principal, to: Principal, amount: nat) => CallResult<TxReceipt>;

    @serviceUpdate
    burn: (canister: BurnParams) => CallResult<Variant<{
        Ok: nat64;
        Err: BurnError;
    }>>;

    @serviceQuery
    balanceOf: (account: Principal) => CallResult<nat>;
}

export class YcToken extends Service {
@serviceQuery
    getHolders: (start: nat, limit: nat) => CallResult<Vec<Tuple<[Principal, nat]>>>;

@serviceQuery
    totalSupply: () => CallResult<nat>;
}
export class DrainCycles extends Service {
    @serviceUpdate
    drainCycles: () => CallResult<Variant<{
        Ok: nat32;
        Err: string;
    }>>;
}

export class Icrc extends Service {
    @serviceQuery
    icrc1_balance_of: (account: Account) => CallResult<nat>;
}

export class Archive extends Service {

    @serviceUpdate
    archive: (transactions: Vec<TransactionWithId>) => CallResult<ArchiveResponse>;

    @serviceQuery
    get_transactions: (request: GetTransactionsRequest) => CallResult<TransactionRange>;

    @serviceQuery
    get_transaction: (tx_index: nat) => CallResult<Opt<TransactionWithId>>;

    @serviceQuery
    length: () => CallResult<nat>;
}