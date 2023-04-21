
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
export function base64ToUint8Array(base64String: string): Uint8Array {
    const binaryString = atob(base64String);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; ++i) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

