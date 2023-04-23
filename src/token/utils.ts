import {blob, nat} from "azle";
import {state} from "./state";

export function hexToUint8Array(hexString: string): Uint8Array {
    if (hexString.length % 2 !== 0) {
        throw new Error("Invalid hex string length");
    }

    const byteArray = new Uint8Array(hexString.length / 2);

    for (let i = 0; i < hexString.length; i += 2) {
        byteArray[i / 2] = parseInt(hexString.slice(i, i + 2), 16);
    }

    return byteArray;
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

export function base64ToUint8Array(base64String: string): Uint8Array {
    const binaryString = atob(base64String);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; ++i) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

export function uint8ToString(uint8Array: Uint8Array): string {
    let utf8String = '';
    for (let i = 0; i < uint8Array.length; i++) {
        const byte = uint8Array[i];
        if (byte < 0x80) {
            utf8String += String.fromCharCode(byte);
        } else if (byte < 0xE0) {
            utf8String += String.fromCharCode(((byte & 0x1F) << 6) | (uint8Array[i + 1] & 0x3F));
            i++;
        } else if (byte < 0xF0) {
            utf8String += String.fromCharCode(((byte & 0xF) << 12) | ((uint8Array[i + 1] & 0x3F) << 6) | (uint8Array[i + 2] & 0x3F));
            i += 2;
        } else {
            throw new Error('Invalid byte sequence in UTF-8 data');
        }
    }
    return utf8String;
}

export function stringToUint8(str: string): blob {
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
    return new Uint8Array(utf8Bytes);
}

export function durationToSeconds(duration: number): nat {
    return BigInt(duration * 1e9);
}