import type { Provider } from '@saberhq/solana-contrib';
import { TransactionEnvelope } from '@saberhq/solana-contrib';
import { PublicKey } from '@solana/web3.js';
import Decimal from 'decimal.js';
import { PoolInfo, Token, WithdrawQuote, DepositQuote } from '../types';
export declare class Pool {
    private provider;
    private info;
    constructor(provider: Provider, info: PoolInfo);
    static createPool(provider: Provider, owner: PublicKey, tradeFee: number, inputToken: Token, outputToken: Token, inputTokenAmount: Decimal, outputTokenAmount: Decimal): Promise<{
        address: PublicKey;
        mint: PublicKey;
        tx: TransactionEnvelope;
    }>;
    getDepositQuote(maxTokenAIn: Decimal, maxTokenBIn: Decimal, slippage?: number): Promise<DepositQuote>;
    deposit(owner: PublicKey, maxTokenAIn: Decimal, maxTokenBIn: Decimal, minPoolTokenAmountOut: Decimal): Promise<TransactionEnvelope>;
    static computeWithdrawQuote(config: PoolInfo, withdrawTokenAmount: Decimal, withdrawTokenMint: PublicKey, slippage?: number): WithdrawQuote;
    withdraw(owner: PublicKey, poolTokenAmountIn: Decimal): Promise<TransactionEnvelope>;
}
