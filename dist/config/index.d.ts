import type { Cluster } from '@solana/web3.js';
import { Token, PoolConfig, BondingConfig, StakingConfig } from '../types';
export declare const tokens: Record<Cluster, Token[]>;
export declare const pools: Record<Cluster, PoolConfig[]>;
export declare const bondings: Record<Cluster, BondingConfig[]>;
export declare const stakings: Record<Cluster, StakingConfig[]>;
