import { Instruction } from '../types';
import type { Provider } from '@saberhq/solana-contrib';
import { TransactionEnvelope } from '@saberhq/solana-contrib';
export declare class TransactionBuilder {
    private provider;
    private instructions;
    constructor(provider: Provider);
    addInstruction(instruction: Instruction): TransactionBuilder;
    build(): TransactionEnvelope;
}
