import {Account} from "./types";
import {ic} from "azle";

export const MINTING_ACCOUNT: Account = {
    subaccount:
        hexToUint8Array("5f7d5d5a537c29ac3bc371104db6c85a6a89c6d153a6a697a92b97b58d1e6af9")
    ,
    owner: ic.id()
};

export const DAO_TREASURY: Account = {
    subaccount: null,
    owner: ic.id()
};

function hexToUint8Array(hexString: string): Uint8Array {
    if (hexString.length % 2 !== 0) {
        throw new Error("Invalid hex string length");
    }

    const byteArray = new Uint8Array(hexString.length / 2);

    for (let i = 0; i < hexString.length; i += 2) {
        byteArray[i / 2] = parseInt(hexString.slice(i, i + 2), 16);
    }

    return byteArray;
}


