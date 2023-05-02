import {blob, nat, Opt, Principal} from "azle";
import {Archive} from "./constants";
import devCanister from "../../.dfx/local/canister_ids.json";
import prodCanister from "../../canister_ids.json";
export const JSON_BIGINT = (error: any) => JSON.stringify(error, (_, v) => typeof v === 'bigint' ? `${v}n` : v)
export function PARSE_BIGINT(jsonStr: string): any {
    return JSON.parse(jsonStr, (key, value) => {
        if (typeof value === 'string' && /^\d+n$/.test(value)) {
            return BigInt(value.slice(0, -1));
        }
        return value;
    });
}
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

export function uint8ArrayToHexString(uint8Array: Opt<Uint8Array>): string {
    let hexString = '';
    if (!uint8Array) {
        return hexString;
    }

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

export function archiveCanister(canisterId: string) {
    return new Archive(Principal.fromText(prodCanister.token.ic !== canisterId ? devCanister.archive.local : prodCanister.archive.ic));
}

export class Queue<T> {
    public items: T[] = [];

    enqueue(item: T): void {
        this.items.push(item);
    }

    dequeue(): T | undefined {
        return this.items.shift();
    }

    isEmpty(): boolean {
        return this.items.length === 0;
    }

    size(): number {
        return this.items.length;
    }

    clear(): void {
        this.items = [];
    }
}

export class CircularBuffer<T> implements Iterable<T> {
    private buffer: (T | undefined)[] = new Array(this.max_size);
    private head = 0;
    private tail = 0;
    public length = 0;
    public temporaryArchive = new Queue<T>();
    constructor(private max_size: number, initialValues?: T[]) {
        this.buffer = new Array(max_size).fill(undefined);
        if (initialValues) {
            for (let i = 0; i < initialValues.length; i++) {
                this.add(initialValues[i]);
            }
        }
    }

    push(element: T) {
        this.add(element);
    }

    add(element: T) {
        if (this.length < this.max_size) {
            this.buffer[this.head] = element;
            this.head = (this.head + 1) % this.max_size;
            this.length++;
        } else {
            this.buffer[this.tail] = element;
            this.tail = (this.tail + 1) % this.max_size;
        }
        this.temporaryArchive.enqueue(element as T);
    }

    get(index: number): T {
        if (index < 0 || index >= this.length) {
            throw new Error(`Index ${index} out of bounds`);
        }
        const value = this.buffer[(this.tail + index) % this.max_size];
        if (value === undefined) {
            throw new Error(`Index ${index} is undefined`);
        }

        return value;
    }

    slice(start = 0, end = this.length): T[] {
        if (start < 0) {
            start += this.length;
        }
        if (end < 0) {
            end += this.length;
        }
        start = Math.max(0, Math.min(this.length, start));
        end = Math.max(0, Math.min(this.length, end));
        const result: T[] = [];
        for (let i = start; i < end; i++) {
            const value = this.get(i);
            if (value !== undefined) {
                result.push(value);
            }
        }
        return result;
    }

    [Symbol.iterator](): Iterator<T> {
        let index = 0;
        const buffer = this.buffer;
        const count = this.length;
        const tail = this.tail;
        const max_size = this.max_size;

        return {
            next(): IteratorResult<T> {
                if (index >= count) {
                    return { done: true, value: undefined };
                }
                const value = buffer[(tail + index) % max_size];
                index++;
                return { done: false, value } as IteratorYieldResult<T>;
            },
        };
    }
}

export function objectToUint8Array(obj: object): Uint8Array {
    const str = JSON_BIGINT(obj);
    const arr = new Uint8Array(str.length);
    for (let i = 0; i < str.length; i++) {
        arr[i] = str.charCodeAt(i);
    }
    return arr;
}

export function uint8ArrayToObject<T>(uint8Arr: Uint8Array): T {
    let str = '';
    for (let i = 0; i < uint8Arr.length; i++) {
        str += String.fromCharCode(uint8Arr[i]);
    }
    return PARSE_BIGINT(str);
}