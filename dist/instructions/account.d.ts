import { u64 } from '@solana/spl-token';
import { Keypair, PublicKey } from '@solana/web3.js';
import { Instruction, ResolvedTokenAddressInstruction } from '../types';
export declare const createWSOLAccountInstructions: (owner: PublicKey, solMint: PublicKey, amountIn: u64, rentExemptLamports: number) => ResolvedTokenAddressInstruction;
export declare function createAssociatedTokenAccountInstruction(associatedTokenAddress: PublicKey, fundSource: PublicKey, destination: PublicKey, tokenMint: PublicKey, fundAddressOwner: PublicKey): Instruction;
export declare const createApprovalInstruction: (ownerAddress: PublicKey, approveAmount: u64, tokenUserAddress: PublicKey, userTransferAuthority?: Keypair | undefined) => {
    userTransferAuthority: Keypair;
} & Instruction;
