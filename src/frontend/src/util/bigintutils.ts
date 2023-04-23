import bigDecimal from "js-big-decimal";
import { SHA256, enc } from 'crypto-js';

export const DECIMALS = 100000000;
export function bigIntToDecimal(big: BigInt | number) {
    var result = new bigDecimal(big?.toString() || 1);
    var decimal = new bigDecimal(DECIMALS);
    return result.divide(decimal, 8);
}

export function bigIntToDecimalPrettyString(big: BigInt | number) {
    return bigIntToDecimal(big).getPrettyValue(3, ",");
}

export function convertToBigInt(numString: string, decimals?: number): bigint {
    const dec = decimals || 8;
    const [left, right] = numString.split('.');
    const wholePart = BigInt(left);
    const decimalPart = right ? BigInt(right) : 0n;
    return wholePart * BigInt(10 ** dec) + decimalPart;
}

export function divideByTrillion(num: bigint): string {
    const trillion = 1000000000000n;
    const result = parseFloat(num.toString(10)) / parseFloat(trillion.toString(10));
    return new Intl.NumberFormat('en-US', {minimumFractionDigits: 3, maximumFractionDigits: 3}).format(result);
}

export function hexToUint8Array(hexString: string): number[] {
    if (hexString.length % 2 !== 0) {
        throw new Error("Invalid hex string length");
    }

    const byteArray = new Uint8Array(hexString.length / 2);

    for (let i = 0; i < hexString.length; i += 2) {
        byteArray[i / 2] = parseInt(hexString.slice(i, i + 2), 16);
    }

    return Array.from(byteArray);
}

export function stringToAccount(data: string): number[] {
    const hashedString = SHA256(data).toString(enc.Hex);
    console.log(hashedString);
    return hexStringToUint8Array(hashedString);
}
export function stringToUint8(str: string): number[] {
    const utf8Bytes = [];
    for (let i = 0; i < str.length; i++) {
        let charCode = str.charCodeAt(i);
        if (charCode < 0x80) {
            utf8Bytes.push(charCode);
        } else if (charCode < 0x800) {
            utf8Bytes.push(0xC0 | (charCode >> 6));
            utf8Bytes.push(0x80 | (charCode & 0x3F));
        } else if (charCode < 0x10000) {
            utf8Bytes.push(0xE0 | (charCode >> 12));
            utf8Bytes.push(0x80 | ((charCode >> 6) & 0x3F));
            utf8Bytes.push(0x80 | (charCode & 0x3F));
        } else if (charCode < 0x110000) {
            utf8Bytes.push(0xF0 | (charCode >> 18));
            utf8Bytes.push(0x80 | ((charCode >> 12) & 0x3F));
            utf8Bytes.push(0x80 | ((charCode >> 6) & 0x3F));
            utf8Bytes.push(0x80 | (charCode & 0x3F));
        } else {
            throw new Error('Invalid Unicode code point');
        }
    }
    return Array.from(new Uint8Array(utf8Bytes));
}

export function generateUUID() {
    let uuid = '';
    const possibleChars = '0123456789abcdefghijklmnopqrstuvwxyz';

    for (let i = 0; i < 8; i++) {
        uuid += possibleChars.charAt(Math.floor(Math.random() * possibleChars.length));
    }

    return uuid;
}

export function hexStringToUint8Array(hexString: string): number[] {
    const uint8Array = new Uint8Array(hexString.length / 2);
    for (let i = 0; i < hexString.length; i += 2) {
        uint8Array[i / 2] = parseInt(hexString.slice(i, i + 2), 16);
    }
    return Array.from(uint8Array);
}

export function uint8ArrayToHexString(uint8Array: Uint8Array): string {
    let hexString = '';
    for (let i = 0; i < uint8Array.length; i++) {
        hexString += uint8Array[i].toString(16).padStart(2, '0');
    }
    return hexString;
}