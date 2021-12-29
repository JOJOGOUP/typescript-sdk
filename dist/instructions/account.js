"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApprovalInstruction = exports.createAssociatedTokenAccountInstruction = exports.createWSOLAccountInstructions = void 0;
const spl_token_1 = require("@solana/spl-token");
const web3_js_1 = require("@solana/web3.js");
const utils_1 = require("../utils");
const createWSOLAccountInstructions = (owner, solMint, amountIn, rentExemptLamports) => {
    const tempAccount = new web3_js_1.Keypair();
    const createAccountInstruction = web3_js_1.SystemProgram.createAccount({
        fromPubkey: owner,
        newAccountPubkey: tempAccount.publicKey,
        lamports: amountIn.toNumber() + rentExemptLamports,
        space: spl_token_1.AccountLayout.span,
        programId: spl_token_1.TOKEN_PROGRAM_ID,
    });
    const initAccountInstruction = spl_token_1.Token.createInitAccountInstruction(spl_token_1.TOKEN_PROGRAM_ID, solMint, tempAccount.publicKey, owner);
    const closeWSOLAccountInstruction = spl_token_1.Token.createCloseAccountInstruction(spl_token_1.TOKEN_PROGRAM_ID, tempAccount.publicKey, owner, owner, []);
    return {
        address: tempAccount.publicKey,
        instructions: [createAccountInstruction, initAccountInstruction],
        cleanupInstructions: [closeWSOLAccountInstruction],
        signers: [tempAccount],
    };
};
exports.createWSOLAccountInstructions = createWSOLAccountInstructions;
function createAssociatedTokenAccountInstruction(associatedTokenAddress, fundSource, destination, tokenMint, fundAddressOwner) {
    const keys = [
        {
            pubkey: fundSource,
            isSigner: true,
            isWritable: true,
        },
        {
            pubkey: associatedTokenAddress,
            isSigner: false,
            isWritable: true,
        },
        {
            pubkey: destination,
            isSigner: false,
            isWritable: false,
        },
        {
            pubkey: tokenMint,
            isSigner: false,
            isWritable: false,
        },
        {
            pubkey: utils_1.SYSTEM_PROGRAM_ID,
            isSigner: false,
            isWritable: false,
        },
        {
            pubkey: spl_token_1.TOKEN_PROGRAM_ID,
            isSigner: false,
            isWritable: false,
        },
        {
            pubkey: web3_js_1.SYSVAR_RENT_PUBKEY,
            isSigner: false,
            isWritable: false,
        },
    ];
    const createATAInstruction = new web3_js_1.TransactionInstruction({
        keys,
        programId: spl_token_1.ASSOCIATED_TOKEN_PROGRAM_ID,
        data: Buffer.from([]),
    });
    return {
        instructions: [createATAInstruction],
        cleanupInstructions: [],
        signers: [],
    };
}
exports.createAssociatedTokenAccountInstruction = createAssociatedTokenAccountInstruction;
const createApprovalInstruction = (ownerAddress, approveAmount, tokenUserAddress, userTransferAuthority) => {
    userTransferAuthority = userTransferAuthority || new web3_js_1.Keypair();
    const approvalInstruction = spl_token_1.Token.createApproveInstruction(spl_token_1.TOKEN_PROGRAM_ID, tokenUserAddress, userTransferAuthority.publicKey, ownerAddress, [], approveAmount);
    const revokeInstruction = spl_token_1.Token.createRevokeInstruction(spl_token_1.TOKEN_PROGRAM_ID, tokenUserAddress, ownerAddress, []);
    return {
        userTransferAuthority: userTransferAuthority,
        instructions: [approvalInstruction],
        cleanupInstructions: [revokeInstruction],
        signers: [],
    };
};
exports.createApprovalInstruction = createApprovalInstruction;
