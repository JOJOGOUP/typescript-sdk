import type { Provider } from '@saberhq/solana-contrib';
import { StakingInfo, StakingConfig, VestConfigInfo } from '../../types';
import { u64 } from '@solana/spl-token';
import { PublicKey } from '@solana/web3.js';
import { Idl } from '@project-serum/anchor';
import { TransactionEnvelope } from '@saberhq/solana-contrib';
export declare class Staking {
    config: StakingConfig;
    private program;
    private vestingProgram;
    constructor(provider: Provider, config: StakingConfig);
    getUserVestingAddress(): Promise<PublicKey>;
    getVestingInfo(addr: PublicKey): Promise<import("@project-serum/anchor/dist/cjs/program/namespace/types").TypeDef<import("@project-serum/anchor/dist/cjs/idl").IdlTypeDef, import("@project-serum/anchor").IdlTypes<Idl>> | null>;
    getVestConfigInfo(): Promise<VestConfigInfo>;
    getStakingInfo(): Promise<StakingInfo>;
    toVToken(amount: u64): Promise<TransactionEnvelope>;
    vestAll(): Promise<TransactionEnvelope>;
    stake(amount: u64): Promise<TransactionEnvelope>;
    stakeAll(): Promise<TransactionEnvelope>;
    unvestAll(): Promise<TransactionEnvelope>;
    unstake(amount: u64): Promise<TransactionEnvelope>;
    claimVestedToken(tokenMint: PublicKey): Promise<TransactionEnvelope>;
    static estimatedVestingClaimable(halfLifeDuration: number, claimAllDuration: number, vestedHolderAmount: u64, lastUpdatedTime: number, lastVestTime: number, claimableAmount: u64, updateTime: number): u64;
}
