import { BondingInfo, BondingConfig, PayoutInfo } from '../../types';
import { u64 } from '@solana/spl-token';
import { Provider } from '@project-serum/anchor';
import { TransactionEnvelope } from '@saberhq/solana-contrib';
export declare class Bonding {
    config: BondingConfig;
    private program;
    constructor(provider: Provider, config: BondingConfig);
    getBondingInfo(): Promise<BondingInfo>;
    private valueOf;
    private debtRatio;
    private price;
    calcPayout(bondingInfo: BondingInfo, payoutTokenDecimals: number, depositTokenDecimals: number, amount?: number): PayoutInfo;
    bond(amount: u64): Promise<TransactionEnvelope>;
}
