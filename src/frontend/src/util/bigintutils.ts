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

export function convertToBigInt(numString: string): bigint {
    const [left, right] = numString.split('.');
    const wholePart = BigInt(left);
    const decimalPart = right ? BigInt(right) : 0n;
    return wholePart * BigInt(10 ** 8) + decimalPart;
}