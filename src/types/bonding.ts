import { u64 } from '@solana/spl-token';
import { PublicKey } from '@solana/web3.js';

export type LPInfo = {
  tokenAHolder: PublicKey;
  tokenBHolder: PublicKey;
  tokenADecimals: number;
  tokenBDecimals: number;
}

export type PayoutInfo = {
  payoutAmount: u64;
  internalPrice: u64;
}

export type BondingConfig = {
  address: PublicKey;
  payoutAsset: PublicKey;
  staking: PublicKey;
}

export type BondingInfo = {
  address: PublicKey;
  payoutHolder: PublicKey;
  payoutTokenMint: PublicKey;
  depositHolder: PublicKey;
  depositTokenMint: PublicKey;
  depositHolderAmount: u64;
  bondingSupply: u64;
  maxPayout: number;
  maxDebt: u64;
  minPrice: u64;
  totalDebt: u64;
  controlVariable: number;
  decayFactor: number;
  lastDecay: number;
}

export type VestConfigInfo = {
  vestMint: PublicKey;
  claimAllDuration: number;
  halfLifeDuration: number;
  claimableHolder: PublicKey;
  claimableMint: PublicKey;
}