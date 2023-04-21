import bigDecimal from "js-big-decimal";

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