import { Keypair, PublicKey, TransactionInstruction } from '@solana/web3.js';
import { Numberu64 } from '@solana/spl-token-swap';
export declare const createInitSwapInstruction: (tokenSwapAccount: Keypair, authority: PublicKey, tokenAccountA: PublicKey, tokenAccountB: PublicKey, tokenPool: PublicKey, feeAccount: PublicKey, tokenAccountPool: PublicKey, tokenProgramId: PublicKey, swapProgramId: PublicKey, tradeFeeNumerator: number, tradeFeeDenominator: number, ownerTradeFeeNumerator: number, ownerTradeFeeDenominator: number, ownerWithdrawFeeNumerator: number, ownerWithdrawFeeDenominator: number, hostFeeNumerator: number, hostFeeDenominator: number, curveType: number, curveParameters?: Numberu64) => TransactionInstruction;