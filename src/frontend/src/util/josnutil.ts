import {hexStringToUint8Array} from "./bigintutils";
import {enc, SHA256} from "crypto-js";

export const JSON_BIGINT = (error) => JSON.stringify(error, (_, v) => typeof v === 'bigint' ? `${v}n` : v)


export function stringToHash(data: string): string {
    const hashedString = SHA256(data).toString(enc.Hex);
    return hashedString;
}