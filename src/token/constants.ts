import {Account} from "./types";
import {ic} from "azle";

export const MINTING_ACCOUNT: Account = {
    subaccount: Uint8Array.from(
        [95,233,64,37,192,106,191,98,154,167,70,107,209,68,138,198,179,172,188,71,32,91,120,196,39,40,14,43,235,234,23,198]
    ),
    owner: ic.id()
};

export const DAO_TREASURY: Account = {
    subaccount: Uint8Array.from(
        [95,233,40,101,109,16,182,59,91,116,171,178,142,184,104,221,170,38,250,217,215,18,168,102,128,236,120,72,36,239,37,16]
    ),
    owner: ic.id()
};

