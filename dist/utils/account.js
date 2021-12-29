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
exports.transferToken = exports.createTokenMint = exports.createTokenAccount = exports.getTokenMintInfo = exports.getTokenAccountInfo = exports.deserializeAccount = exports.TokenAccountLayout = void 0;
const spl_token_1 = require("@solana/spl-token");
const web3_js_1 = require("@solana/web3.js");
/**
 * Layout for a TokenAccount.
 */
exports.TokenAccountLayout = spl_token_1.AccountLayout;
const deserializeAccount = (data) => {
    const accountInfo = exports.TokenAccountLayout.decode(data);
    const mint = new web3_js_1.PublicKey(accountInfo.mint);
    const owner = new web3_js_1.PublicKey(accountInfo.owner);
    const amount = spl_token_1.u64.fromBuffer(accountInfo.amount);
    let delegate;
    let delegatedAmount;
    if (accountInfo.delegateOption === 0) {
        delegate = null;
        delegatedAmount = new spl_token_1.u64(0);
    }
    else {
        delegate = new web3_js_1.PublicKey(accountInfo.delegate);
        delegatedAmount = spl_token_1.u64.fromBuffer(accountInfo.delegatedAmount);
    }
    const isInitialized = accountInfo.state !== 0;
    const isFrozen = accountInfo.state === 2;
    let rentExemptReserve;
    let isNative;
    if (accountInfo.isNativeOption === 1) {
        rentExemptReserve = spl_token_1.u64.fromBuffer(accountInfo.isNative);
        isNative = true;
    }
    else {
        rentExemptReserve = null;
        isNative = false;
    }
    let closeAuthority;
    if (accountInfo.closeAuthorityOption === 0) {
        closeAuthority = null;
    }
    else {
        closeAuthority = new web3_js_1.PublicKey(accountInfo.closeAuthority);
    }
    return {
        mint,
        owner,
        amount,
        delegate,
        delegatedAmount,
        isInitialized,
        isFrozen,
        rentExemptReserve,
        isNative,
        closeAuthority,
    };
};
exports.deserializeAccount = deserializeAccount;
const getTokenAccountInfo = (provider, tokenAccount) => __awaiter(void 0, void 0, void 0, function* () {
    const assetHolderInfo = yield provider.connection.getAccountInfo(tokenAccount);
    return assetHolderInfo ? (0, exports.deserializeAccount)(assetHolderInfo.data) : null;
});
exports.getTokenAccountInfo = getTokenAccountInfo;
const getTokenMintInfo = (provider, tokenMint) => __awaiter(void 0, void 0, void 0, function* () {
    const token = new spl_token_1.Token(provider.connection, tokenMint, spl_token_1.TOKEN_PROGRAM_ID, {});
    return token.getMintInfo();
});
exports.getTokenMintInfo = getTokenMintInfo;
const createTokenAccount = ({ provider, mint, owner = provider.wallet.publicKey, payer = provider.wallet.publicKey, accountSigner = web3_js_1.Keypair.generate(), }) => __awaiter(void 0, void 0, void 0, function* () {
    // Allocate memory for the account
    const balanceNeeded = yield spl_token_1.Token.getMinBalanceRentForExemptAccount(provider.connection);
    const tokenAccount = accountSigner.publicKey;
    return {
        address: accountSigner.publicKey,
        instructions: [
            web3_js_1.SystemProgram.createAccount({
                fromPubkey: payer,
                newAccountPubkey: accountSigner.publicKey,
                lamports: balanceNeeded,
                space: exports.TokenAccountLayout.span,
                programId: spl_token_1.TOKEN_PROGRAM_ID,
            }),
            spl_token_1.Token.createInitAccountInstruction(spl_token_1.TOKEN_PROGRAM_ID, mint, tokenAccount, owner),
        ],
        cleanupInstructions: [],
        signers: [accountSigner]
    };
});
exports.createTokenAccount = createTokenAccount;
function createTokenMint(provider, authority, mint, decimals = 6) {
    return __awaiter(this, void 0, void 0, function* () {
        const instructions = [
            web3_js_1.SystemProgram.createAccount({
                fromPubkey: provider.wallet.publicKey,
                newAccountPubkey: mint,
                space: 82,
                lamports: yield provider.connection.getMinimumBalanceForRentExemption(82),
                programId: spl_token_1.TOKEN_PROGRAM_ID,
            }),
            spl_token_1.Token.createInitMintInstruction(spl_token_1.TOKEN_PROGRAM_ID, mint, decimals, authority, null),
        ];
        return {
            instructions,
            signers: [],
            cleanupInstructions: []
        };
    });
}
exports.createTokenMint = createTokenMint;
function transferToken(source, destination, amount, payer) {
    return __awaiter(this, void 0, void 0, function* () {
        const instructions = [
            spl_token_1.Token.createTransferInstruction(spl_token_1.TOKEN_PROGRAM_ID, source, destination, payer, [], amount)
        ];
        return {
            instructions,
            signers: [],
            cleanupInstructions: []
        };
    });
}
exports.transferToken = transferToken;
