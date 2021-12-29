import { u64 } from '@solana/spl-token';
import Decimal from 'decimal.js';
export declare const ZERO_DECIMAL: Decimal;
export declare const ONE_DECIMAL: Decimal;
export declare const ONE_HUNDRED_DECIMAL: Decimal;
export declare class DecimalUtil {
    static fromString(input: string, shift?: number): Decimal;
    static fromNumber(input: number, shift?: number): Decimal;
    static fromU64(input: u64, shift?: number): Decimal;
    static toU64(input: Decimal, shift?: number): u64;
    static beautify(input: Decimal, fixed?: number): string;
}
