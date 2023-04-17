import {Account} from "./types";
import {ic} from "azle";

export const MINTING_ACCOUNT: Account = {
    subaccount: Uint8Array.from(
        [95,233,64,37,192,106,191,98,154,167,70,107,209,68,138,198,179,172,188,71,32,91,120,196,39,40,14,43,235,234,23,198]
    ),
    owner: ic.id()
};
