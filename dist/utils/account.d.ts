/// <reference types="node" />
import type { Layout } from '@solana/buffer-layout';
import type { AccountInfo } from '@solana/spl-token';
import type { Provider } from '@saberhq/solana-contrib';
import { AccountInfo as TokenAccountInfo, MintInfo } from '@solana/spl-token';
import { PublicKey, Signer } from '@solana/web3.js';
import { Instruction } from '../types';
/**
 * Layout with decode/encode types.
 */
export declare type TypedLayout<T> = Omit<Layout, 'decode' | 'encode'> & {
    decode: (data: Buffer) => T;
    encode: (data: T, out: Buffer) => number;
};
export declare type ResolvedTokenAccountInstruction = {
    address: PublicKey;
} & Instruction;
/**
 * Layout for a TokenAccount.
 */
export declare const TokenAccountLayout: TypedLayout<{
    mint: Buffer;
    owner: Buffer;
    amount: Buffer;
    delegateOption: number;
    delegate: Buffer;
    state: number;
    delegatedAmount: Buffer;
    isNativeOption: number;
    isNative: Buffer;
    closeAuthorityOption: number;
    closeAuthority: Buffer;
}>;
export declare const deserializeAccount: (data: Buffer) => Omit<AccountInfo, "address">;
export declare const getTokenAccountInfo: (provider: Provider, tokenAccount: PublicKey) => Promise<Omit<TokenAccountInfo, "address"> | null>;
export declare const getTokenMintInfo: (provider: Provider, tokenMint: PublicKey) => Promise<MintInfo>;
export declare const createTokenAccount: ({ provider, mint, owner, payer, accountSigner, }: {
    provider: Provider;
    mint: PublicKey;
    owner?: PublicKey | undefined;
    payer?: PublicKey | undefined;
    /**
     * The keypair of the account to be created.
     */
    accountSigner?: Signer | undefined;
}) => Promise<ResolvedTokenAccountInstruction>;
export declare function createTokenMint(provider: Provider, authority: PublicKey, mint: PublicKey, decimals?: number): Promise<Instruction>;
