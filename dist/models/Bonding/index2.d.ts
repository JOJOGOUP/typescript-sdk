import type { Provider } from '@saberhq/solana-contrib';
import { BondingConfig, BondingInfo } from '../../types';
import { PublicKey } from '@solana/web3.js';
import { u64 } from '@solana/spl-token';
import { Idl } from '@project-serum/anchor';
import { TransactionEnvelope } from '@saberhq/solana-contrib';
export declare class Bonding {
    config: BondingConfig;
    private program;
    constructor(provider: Provider, config: BondingConfig);
    getUserVestingAddress(): Promise<PublicKey>;
    getUserVesting(): Promise<import("@project-serum/anchor/dist/cjs/program/namespace/types").TypeDef<import("@project-serum/anchor/dist/cjs/idl").IdlTypeDef, import("@project-serum/anchor").IdlTypes<Idl>> | null>;
    getBondingInfo(): Promise<BondingInfo>;
    private decay;
    private valuation;
    calcPayout(amount: u64): Promise<u64>;
    purchaseToken(amount: u64): Promise<TransactionEnvelope>;
    claimVestedToken(tokenMint: PublicKey): Promise<TransactionEnvelope>;
    static estimatedVestingClaimable(halfLifeDuration: number, claimAllDuration: number, vestedHolderAmount: u64, lastUpdatedTime: number, lastVestTime: number, claimableAmount: u64, updateTime: number): u64;
}
