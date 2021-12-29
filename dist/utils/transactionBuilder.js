"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionBuilder = void 0;
const solana_contrib_1 = require("@saberhq/solana-contrib");
class TransactionBuilder {
    constructor(provider) {
        this.provider = provider;
        this.instructions = [];
    }
    addInstruction(instruction) {
        this.instructions.push(instruction);
        return this;
    }
    build() {
        let instructions = [];
        let cleanupInstructions = [];
        let signers = [];
        this.instructions.forEach((curr) => {
            instructions = instructions.concat(curr.instructions);
            cleanupInstructions = cleanupInstructions.concat(curr.cleanupInstructions);
            signers = signers.concat(curr.signers);
        });
        return new solana_contrib_1.TransactionEnvelope(this.provider, instructions.concat(cleanupInstructions), signers);
    }
}
exports.TransactionBuilder = TransactionBuilder;
