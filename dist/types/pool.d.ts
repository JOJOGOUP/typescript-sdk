import { PublicKey } from '@solana/web3.js';
import { u64 } from '@solana/spl-token';
import Decimal from 'decimal.js';
import { Token, FeeStructure } from '../types';
import { CurveType } from '../utils';
export declare type PoolToken = Token & {
    addr: PublicKey;
    amount: u64;
};
export declare type PoolInfo = {
    address: PublicKey;
    nonce: number;
    authority: PublicKey;
    poolTokenMint: PublicKey;
    poolTokenDecimals: number;
    feeAccount: PublicKey;
    curveType: CurveType;
    feeStructure: FeeStructure;
    tokenA: PoolToken;
    tokenB: PoolToken;
    lpSupply: Decimal;
    amp?: number;
};
export declare type PoolConfig = {
    pair: string;
    addr: PublicKey;
};
export declare type PoolRecords = Record<string, PoolInfo>;
