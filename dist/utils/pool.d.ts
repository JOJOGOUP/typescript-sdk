import { Connection, PublicKey } from '@solana/web3.js';
import type { PoolInfo, Token } from '../types';
export declare function getPoolInfo(connection: Connection, poolAddr: PublicKey, tokens: Token[]): Promise<PoolInfo>;
export declare function computeLPPrice(pool: PoolInfo, prices: Record<string, number>): number;
export declare function getTokenPriceViaPools(tokenSymbol: string, poolInfos: PoolInfo[], prices: Record<string, number>): number;
export declare function computeRate(pool: PoolInfo, inputToken?: Token): number;
export declare function getTokenPercent(pool: PoolInfo): {
    tokenAPercent: number;
    tokenBPercent: number;
};
