"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createInitSwapInstruction = void 0;
const web3_js_1 = require("@solana/web3.js");
const BufferLayout = __importStar(require("@solana/buffer-layout"));
const spl_token_swap_1 = require("@solana/spl-token-swap");
const createInitSwapInstruction = (tokenSwapAccount, authority, tokenAccountA, tokenAccountB, tokenPool, feeAccount, tokenAccountPool, tokenProgramId, swapProgramId, tradeFeeNumerator, tradeFeeDenominator, ownerTradeFeeNumerator, ownerTradeFeeDenominator, ownerWithdrawFeeNumerator, ownerWithdrawFeeDenominator, hostFeeNumerator, hostFeeDenominator, curveType, curveParameters = new spl_token_swap_1.Numberu64(0)) => {
    const keys = [
        { pubkey: tokenSwapAccount.publicKey, isSigner: false, isWritable: true },
        { pubkey: authority, isSigner: false, isWritable: false },
        { pubkey: tokenAccountA, isSigner: false, isWritable: false },
        { pubkey: tokenAccountB, isSigner: false, isWritable: false },
        { pubkey: tokenPool, isSigner: false, isWritable: true },
        { pubkey: feeAccount, isSigner: false, isWritable: false },
        { pubkey: tokenAccountPool, isSigner: false, isWritable: true },
        { pubkey: tokenProgramId, isSigner: false, isWritable: false },
    ];
    const commandDataLayout = BufferLayout.struct([
        BufferLayout.u8('instruction'),
        BufferLayout.nu64('tradeFeeNumerator'),
        BufferLayout.nu64('tradeFeeDenominator'),
        BufferLayout.nu64('ownerTradeFeeNumerator'),
        BufferLayout.nu64('ownerTradeFeeDenominator'),
        BufferLayout.nu64('ownerWithdrawFeeNumerator'),
        BufferLayout.nu64('ownerWithdrawFeeDenominator'),
        BufferLayout.nu64('hostFeeNumerator'),
        BufferLayout.nu64('hostFeeDenominator'),
        BufferLayout.u8('curveType'),
        BufferLayout.blob(32, 'curveParameters'),
    ]);
    let data = Buffer.alloc(1024);
    // package curve parameters
    // NOTE: currently assume all curves take a single parameter, u64 int
    //       the remaining 24 of the 32 bytes available are filled with 0s
    let curveParamsBuffer = Buffer.alloc(32);
    curveParameters.toBuffer().copy(curveParamsBuffer);
    {
        const encodeLength = commandDataLayout.encode({
            instruction: 0,
            tradeFeeNumerator,
            tradeFeeDenominator,
            ownerTradeFeeNumerator,
            ownerTradeFeeDenominator,
            ownerWithdrawFeeNumerator,
            ownerWithdrawFeeDenominator,
            hostFeeNumerator,
            hostFeeDenominator,
            curveType,
            curveParameters: curveParamsBuffer,
        }, data);
        data = data.slice(0, encodeLength);
    }
    return new web3_js_1.TransactionInstruction({
        keys,
        programId: swapProgramId,
        data,
    });
};
exports.createInitSwapInstruction = createInitSwapInstruction;
