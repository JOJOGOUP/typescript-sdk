"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deriveAssociatedTokenAddress = exports.createAssociatedTokenAddress = exports.resolveOrCreateAssociatedTokenAddress = void 0;
const spl_token_1 = require("@solana/spl-token");
const web3_js_1 = require("@solana/web3.js");
const types_1 = require("../types");
const utils_1 = require("../utils");
const instructions_1 = require("../instructions");
/**
 * IMPORTANT: wrappedSolAmountIn should only be used for input/source token that
 *            could be SOL. This is because when SOL is the output, it is the end
 *            destination, and thus does not need to be wrapped with an amount.
 *
 * @param connection Solana connection class
 * @param owner The keypair for the user's wallet or just the user's public key
 * @param tokenMint Token mint address
 * @param wrappedSolAmountIn Optional. Only use for input/source token that could be SOL
 * @returns
 */
function resolveOrCreateAssociatedTokenAddress(connection, owner, tokenMint, wrappedSolAmountIn = new spl_token_1.u64(0)) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!tokenMint.equals(utils_1.SOL_TOKEN_MINT)) {
            const derivedAddress = yield deriveAssociatedTokenAddress(owner, tokenMint);
            // Check if current wallet has an ATA for this spl-token mint. If not, create one.
            let resolveAtaInstruction = types_1.emptyInstruction;
            let tokenAccountInfo = yield connection.getAccountInfo(derivedAddress);
            if (tokenAccountInfo) {
                tokenAccountInfo = (0, utils_1.deserializeAccount)(tokenAccountInfo.data);
            }
            if (!tokenAccountInfo) {
                resolveAtaInstruction = (0, instructions_1.createAssociatedTokenAccountInstruction)(derivedAddress, owner, owner, tokenMint, owner);
            }
            return {
                address: derivedAddress,
                instructions: resolveAtaInstruction.instructions,
                cleanupInstructions: resolveAtaInstruction.cleanupInstructions,
                signers: resolveAtaInstruction.signers,
            };
        }
        else {
            // TODO: Is there a way to store this cleaner?
            const accountRentExempt = yield connection.getMinimumBalanceForRentExemption(spl_token_1.AccountLayout.span);
            // Create a temp-account to transfer SOL in the form of WSOL
            return (0, instructions_1.createWSOLAccountInstructions)(owner, utils_1.SOL_TOKEN_MINT, wrappedSolAmountIn, accountRentExempt);
        }
    });
}
exports.resolveOrCreateAssociatedTokenAddress = resolveOrCreateAssociatedTokenAddress;
function createAssociatedTokenAddress(connection, owner, tokenMint, wrappedSolAmountIn = new spl_token_1.u64(0)) {
    return __awaiter(this, void 0, void 0, function* () {
        const accountKP = web3_js_1.Keypair.generate();
        const resolveAtaInstruction = (0, instructions_1.createAssociatedTokenAccountInstruction)(accountKP.publicKey, owner, owner, tokenMint, owner);
        return {
            address: accountKP.publicKey,
            instructions: resolveAtaInstruction.instructions,
            cleanupInstructions: resolveAtaInstruction.cleanupInstructions,
            signers: resolveAtaInstruction.signers,
        };
    });
}
exports.createAssociatedTokenAddress = createAssociatedTokenAddress;
function deriveAssociatedTokenAddress(walletAddress, tokenMint) {
    return __awaiter(this, void 0, void 0, function* () {
        return (yield web3_js_1.PublicKey.findProgramAddress([walletAddress.toBuffer(), spl_token_1.TOKEN_PROGRAM_ID.toBuffer(), tokenMint.toBuffer()], spl_token_1.ASSOCIATED_TOKEN_PROGRAM_ID))[0];
    });
}
exports.deriveAssociatedTokenAddress = deriveAssociatedTokenAddress;
