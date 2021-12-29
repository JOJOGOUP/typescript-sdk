import { PublicKey } from '@solana/web3.js';
import { FeeStructure } from '../types';
export declare const PNG_TOKEN_SWAP_ID: PublicKey;
export declare const PNG_BONDING_ID: PublicKey;
export declare const PNG_VESTING_ID: PublicKey;
export declare const PNG_STAKING_ID: PublicKey;
export declare const PNG_TOKEN_SWAP_FEE_ACCOUNT_OWNER: PublicKey;
export declare const SOL_TOKEN_MINT: PublicKey;
export declare const SYSTEM_PROGRAM_ID: PublicKey;
export declare const PNG_TOKEN_SWAP_FEE_STRUCTURE: FeeStructure;
export declare enum CurveType {
    ConstantProduct = 0,
    ConstantPrice = 1,
    Stable = 2,
    Offset = 3
}
