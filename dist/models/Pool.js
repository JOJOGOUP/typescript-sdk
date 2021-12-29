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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Pool = void 0;
const solana_contrib_1 = require("@saberhq/solana-contrib");
const web3_js_1 = require("@solana/web3.js");
const spl_token_swap_1 = require("@solana/spl-token-swap");
const decimal_js_1 = __importDefault(require("decimal.js"));
const spl_token_1 = require("@solana/spl-token");
const utils_1 = require("../utils");
const instructions_1 = require("../instructions");
class Pool {
    constructor(provider, info) {
        this.provider = provider;
        this.info = info;
    }
    // Create a Pool
    static createPool(provider, owner, tradeFee, inputToken, outputToken, inputTokenAmount, outputTokenAmount) {
        return __awaiter(this, void 0, void 0, function* () {
            const swapAccount = web3_js_1.Keypair.generate();
            const inputTokenMint = new web3_js_1.PublicKey(inputToken.mint), outputTokenMint = new web3_js_1.PublicKey(outputToken.mint);
            const [authority] = yield web3_js_1.PublicKey.findProgramAddress([swapAccount.publicKey.toBuffer()], utils_1.PNG_TOKEN_SWAP_ID);
            // If tokenA is SOL, this will create a new wSOL account with maxTokenAIn_U64
            // Otherwise, get tokenA's associated token account
            const _a = yield (0, utils_1.resolveOrCreateAssociatedTokenAddress)(provider.connection, owner, inputTokenMint, utils_1.DecimalUtil.toU64(inputTokenAmount, inputToken.decimals)), { address: userTokenAPublicKey } = _a, resolveTokenAInstrucitons = __rest(_a, ["address"]);
            // If tokenB is SOL, this will create a new wSOL account with maxTokenBIn_U64
            // Otherwise, get tokenB's associated token account
            const _b = yield (0, utils_1.resolveOrCreateAssociatedTokenAddress)(provider.connection, owner, new web3_js_1.PublicKey(outputTokenMint), utils_1.DecimalUtil.toU64(outputTokenAmount, outputToken.decimals)), { address: userTokenBPublicKey } = _b, resolveTokenBInstrucitons = __rest(_b, ["address"]);
            const _c = yield (0, utils_1.createTokenAccount)({
                provider,
                mint: inputTokenMint,
                owner: authority
            }), { address: swapTokenAAccount } = _c, resolveTokenAAccountInstrucitons = __rest(_c, ["address"]);
            const _d = yield (0, utils_1.createTokenAccount)({
                provider,
                mint: outputTokenMint,
                owner: authority
            }), { address: swapTokenBAccount } = _d, resolveTokenBAccountInstrucitons = __rest(_d, ["address"]);
            const transferTokenAInstruction = spl_token_1.Token.createTransferInstruction(spl_token_1.TOKEN_PROGRAM_ID, userTokenAPublicKey, swapTokenAAccount, owner, [], utils_1.DecimalUtil.toU64(inputTokenAmount, inputToken.decimals));
            const transferTokenBInstruction = spl_token_1.Token.createTransferInstruction(spl_token_1.TOKEN_PROGRAM_ID, userTokenBPublicKey, swapTokenBAccount, owner, [], utils_1.DecimalUtil.toU64(outputTokenAmount, outputToken.decimals));
            const poolMintKP = web3_js_1.Keypair.generate();
            const createPoolMintInstructions = yield (0, utils_1.createTokenMint)(provider, authority, poolMintKP.publicKey, 6);
            const _e = yield (0, utils_1.createTokenAccount)({
                provider,
                mint: poolMintKP.publicKey,
                owner: utils_1.PNG_TOKEN_SWAP_FEE_ACCOUNT_OWNER
            }), { address: feeAccount } = _e, resolveFeeAccountInstructions = __rest(_e, ["address"]);
            // If the user lacks the pool token account, create it
            const _f = yield (0, utils_1.resolveOrCreateAssociatedTokenAddress)(provider.connection, owner, poolMintKP.publicKey), { address: userPoolTokenPublicKey } = _f, resolvePoolTokenInstructions = __rest(_f, ["address"]);
            const intializeInstruction = (0, instructions_1.createInitSwapInstruction)(swapAccount, authority, swapTokenAAccount, swapTokenBAccount, poolMintKP.publicKey, feeAccount, userPoolTokenPublicKey, spl_token_1.TOKEN_PROGRAM_ID, utils_1.PNG_TOKEN_SWAP_ID, tradeFee, utils_1.PNG_TOKEN_SWAP_FEE_STRUCTURE.tradeFeeDenominator, utils_1.PNG_TOKEN_SWAP_FEE_STRUCTURE.ownerTradeFeeNumerator, utils_1.PNG_TOKEN_SWAP_FEE_STRUCTURE.ownerTradeFeeDenominator, utils_1.PNG_TOKEN_SWAP_FEE_STRUCTURE.ownerWithdrawFeeNumerator, utils_1.PNG_TOKEN_SWAP_FEE_STRUCTURE.ownerWithdrawFeeDenominator, 20, 100, utils_1.CurveType.ConstantProduct);
            const balanceNeeded = yield provider.connection.getMinimumBalanceForRentExemption(spl_token_swap_1.TokenSwapLayout.span);
            const createSwapAccountInstruction = web3_js_1.SystemProgram.createAccount({
                fromPubkey: owner,
                newAccountPubkey: swapAccount.publicKey,
                lamports: balanceNeeded,
                space: spl_token_swap_1.TokenSwapLayout.span,
                programId: utils_1.PNG_TOKEN_SWAP_ID,
            });
            yield new solana_contrib_1.TransactionEnvelope(provider, [
                ...createPoolMintInstructions.instructions,
                ...resolveTokenAAccountInstrucitons.instructions,
                ...resolveTokenBAccountInstrucitons.instructions,
                ...resolveFeeAccountInstructions.instructions,
            ], [
                poolMintKP,
                ...resolveTokenAAccountInstrucitons.signers,
                ...resolveTokenBAccountInstrucitons.signers,
                ...resolveFeeAccountInstructions.signers,
            ]).confirm();
            const tx = new solana_contrib_1.TransactionEnvelope(provider, [
                ...resolveTokenAInstrucitons.instructions,
                ...resolveTokenBInstrucitons.instructions,
                ...resolvePoolTokenInstructions.instructions,
                transferTokenAInstruction,
                transferTokenBInstruction,
                createSwapAccountInstruction,
                intializeInstruction,
            ], [
                ...resolveTokenAInstrucitons.signers,
                ...resolveTokenBInstrucitons.signers,
                ...resolvePoolTokenInstructions.signers,
                swapAccount
            ]);
            return {
                address: swapAccount.publicKey,
                mint: poolMintKP.publicKey,
                tx
            };
        });
    }
    getDepositQuote(maxTokenAIn, maxTokenBIn, slippage = 1) {
        return __awaiter(this, void 0, void 0, function* () {
            const { tokenA, tokenB, lpSupply, poolTokenDecimals } = this.info;
            const lpSupply_U64 = utils_1.DecimalUtil.toU64(lpSupply, poolTokenDecimals);
            const maxTokenAIn_U64 = utils_1.DecimalUtil.toU64(maxTokenAIn, tokenA.decimals);
            const maxTokenBIn_U64 = utils_1.DecimalUtil.toU64(maxTokenBIn, tokenB.decimals);
            if (tokenA.amount.eq(utils_1.ZERO_U64) || tokenB.amount.eq(utils_1.ZERO_U64)) {
                return {
                    minPoolTokenAmountOut: utils_1.ZERO_U64,
                    maxTokenAIn: maxTokenAIn_U64,
                    maxTokenBIn: maxTokenBIn_U64,
                };
            }
            const poolTokenAmountWithA = maxTokenAIn_U64
                .mul(utils_1.ONE_THOUSAND_U64)
                .mul(lpSupply_U64)
                .div(tokenA.amount)
                .div(new spl_token_1.u64(slippage).add(utils_1.ONE_THOUSAND_U64));
            const poolTokenAmountWithB = maxTokenBIn_U64
                .mul(utils_1.ONE_THOUSAND_U64)
                .mul(lpSupply_U64)
                .div(tokenB.amount)
                .div(new spl_token_1.u64(slippage).add(utils_1.ONE_THOUSAND_U64));
            // Pick the smaller value of the two to calculate the minimum poolTokenAmount out
            const minPoolTokenAmountOut_U64 = poolTokenAmountWithA.gt(poolTokenAmountWithB)
                ? poolTokenAmountWithB
                : poolTokenAmountWithA;
            return {
                minPoolTokenAmountOut: minPoolTokenAmountOut_U64,
                maxTokenAIn: maxTokenAIn_U64,
                maxTokenBIn: maxTokenBIn_U64,
            };
        });
    }
    deposit(owner, maxTokenAIn, maxTokenBIn, minPoolTokenAmountOut) {
        return __awaiter(this, void 0, void 0, function* () {
            const { tokenA, tokenB, poolTokenDecimals } = this.info;
            const maxTokenAIn_U64 = utils_1.DecimalUtil.toU64(maxTokenAIn, tokenA.decimals);
            const maxTokenBIn_U64 = utils_1.DecimalUtil.toU64(maxTokenBIn, tokenB.decimals);
            const minPoolTokenAmountOut_U64 = utils_1.DecimalUtil.toU64(minPoolTokenAmountOut, poolTokenDecimals);
            // If tokenA is SOL, this will create a new wSOL account with maxTokenAIn_U64
            // Otherwise, get tokenA's associated token account
            const _a = yield (0, utils_1.resolveOrCreateAssociatedTokenAddress)(this.provider.connection, owner, new web3_js_1.PublicKey(tokenA.mint), maxTokenAIn_U64), { address: userTokenAPublicKey } = _a, resolveTokenAInstrucitons = __rest(_a, ["address"]);
            // If tokenB is SOL, this will create a new wSOL account with maxTokenBIn_U64
            // Otherwise, get tokenB's associated token account
            const _b = yield (0, utils_1.resolveOrCreateAssociatedTokenAddress)(this.provider.connection, owner, new web3_js_1.PublicKey(tokenB.mint), maxTokenBIn_U64), { address: userTokenBPublicKey } = _b, resolveTokenBInstrucitons = __rest(_b, ["address"]);
            // If the user lacks the pool token account, create it
            const _c = yield (0, utils_1.resolveOrCreateAssociatedTokenAddress)(this.provider.connection, owner, this.info.poolTokenMint), { address: userPoolTokenPublicKey } = _c, resolvePoolTokenInstructions = __rest(_c, ["address"]);
            // Approve transfer of the tokens being deposited
            const _d = (0, instructions_1.createApprovalInstruction)(owner, maxTokenAIn_U64, userTokenAPublicKey), { userTransferAuthority } = _d, transferTokenAInstruction = __rest(_d, ["userTransferAuthority"]);
            const transferTokenBInstruction = __rest((0, instructions_1.createApprovalInstruction)(owner, maxTokenBIn_U64, userTokenBPublicKey, userTransferAuthority), []);
            const depositInstruction = spl_token_swap_1.TokenSwap.depositAllTokenTypesInstruction(this.info.address, this.info.authority, userTransferAuthority.publicKey, userTokenAPublicKey, userTokenBPublicKey, tokenA.addr, tokenB.addr, this.info.poolTokenMint, userPoolTokenPublicKey, utils_1.PNG_TOKEN_SWAP_ID, spl_token_1.TOKEN_PROGRAM_ID, minPoolTokenAmountOut_U64, maxTokenAIn_U64, maxTokenBIn_U64);
            return new utils_1.TransactionBuilder(this.provider)
                .addInstruction(resolveTokenAInstrucitons)
                .addInstruction(resolveTokenBInstrucitons)
                .addInstruction(resolvePoolTokenInstructions)
                .addInstruction(transferTokenAInstruction)
                .addInstruction(transferTokenBInstruction)
                .addInstruction({
                instructions: [depositInstruction],
                cleanupInstructions: [],
                signers: [
                    userTransferAuthority
                ]
            })
                .build();
        });
    }
    static computeWithdrawQuote(config, withdrawTokenAmount, withdrawTokenMint, slippage = 1) {
        const { tokenA, tokenB, poolTokenMint, poolTokenDecimals, lpSupply } = config;
        // withdrawTokenAmount needs represent amounts for one of the following: poolTokenAmount, tokenAAmount, or tokenBAmount
        // determine which token this amount represents, then calculate poolTokenIn_U64
        let poolTokenIn_U64 = utils_1.ZERO_U64;
        const lpSupplyIn_U64 = utils_1.DecimalUtil.toU64(lpSupply, poolTokenDecimals);
        if (withdrawTokenMint.equals(poolTokenMint)) {
            poolTokenIn_U64 = utils_1.DecimalUtil.toU64(withdrawTokenAmount, poolTokenDecimals);
        }
        else if (withdrawTokenMint.equals(new web3_js_1.PublicKey(tokenA.mint)) ||
            withdrawTokenMint.equals(new web3_js_1.PublicKey(tokenB.mint))) {
            const token = withdrawTokenMint.equals(new web3_js_1.PublicKey(tokenA.mint))
                ? tokenA
                : tokenB;
            const totalAmount = token.mint === tokenA.mint ? tokenA.amount : tokenB.amount;
            const numerator = withdrawTokenAmount;
            const denominator = utils_1.DecimalUtil.fromU64(totalAmount, token.decimals);
            const poolTokenIn = lpSupply.div(denominator).mul(numerator);
            poolTokenIn_U64 = utils_1.DecimalUtil.toU64(poolTokenIn, poolTokenDecimals);
        }
        else {
            throw new Error(`Unable to get withdraw quote with an invalid withdrawTokenMint ${withdrawTokenMint}`);
        }
        if (poolTokenIn_U64.eq(utils_1.ZERO_U64)) {
            return {
                maxPoolTokenAmountIn: utils_1.ZERO_U64,
                minTokenAOut: utils_1.ZERO_U64,
                minTokenBOut: utils_1.ZERO_U64,
            };
        }
        const minTokenAOut = poolTokenIn_U64
            .mul(utils_1.ONE_THOUSAND_U64)
            .mul(tokenA.amount)
            .div(lpSupplyIn_U64)
            .div(new spl_token_1.u64(slippage).add(utils_1.ONE_THOUSAND_U64));
        const minTokenBOut = poolTokenIn_U64
            .mul(utils_1.ONE_THOUSAND_U64)
            .mul(tokenB.amount)
            .div(lpSupplyIn_U64)
            .div(new spl_token_1.u64(slippage).add(utils_1.ONE_THOUSAND_U64));
        return {
            maxPoolTokenAmountIn: poolTokenIn_U64,
            minTokenAOut,
            minTokenBOut,
        };
    }
    withdraw(owner, poolTokenAmountIn) {
        return __awaiter(this, void 0, void 0, function* () {
            const { tokenA, tokenB, feeStructure, poolTokenDecimals, lpSupply } = this.info;
            let feeAmount = utils_1.ZERO_DECIMAL;
            if (feeStructure.ownerWithdrawFeeNumerator !== 0) {
                feeAmount = poolTokenAmountIn.mul(new decimal_js_1.default(feeStructure.ownerWithdrawFeeNumerator)).div(feeStructure.ownerWithdrawFeeDenominator);
            }
            const poolTokenAmount = poolTokenAmountIn.sub(feeAmount);
            const poolTokenAmount_U64 = utils_1.DecimalUtil.toU64(poolTokenAmount, poolTokenDecimals);
            const lpSupplyIn_U64 = utils_1.DecimalUtil.toU64(lpSupply, poolTokenDecimals);
            const tokenAAmount = tokenA.amount
                .mul(poolTokenAmount_U64)
                .div(lpSupplyIn_U64);
            const tokenBAmount = tokenB.amount
                .mul(poolTokenAmount_U64)
                .div(lpSupplyIn_U64);
            // Create a token account for tokenA, if necessary
            const _a = yield (0, utils_1.resolveOrCreateAssociatedTokenAddress)(this.provider.connection, owner, new web3_js_1.PublicKey(tokenA.mint)), { address: userTokenAPublicKey } = _a, resolveTokenAInstrucitons = __rest(_a, ["address"]);
            // Create a token account for tokenB, if necessary
            const _b = yield (0, utils_1.resolveOrCreateAssociatedTokenAddress)(this.provider.connection, owner, new web3_js_1.PublicKey(tokenB.mint)), { address: userTokenBPublicKey } = _b, resolveTokenBInstrucitons = __rest(_b, ["address"]);
            // Get user's poolToken token account
            const _c = yield (0, utils_1.resolveOrCreateAssociatedTokenAddress)(this.provider.connection, owner, this.info.poolTokenMint), { address: userPoolTokenPublicKey } = _c, resolvePoolTokenInstructions = __rest(_c, ["address"]);
            // Approve transfer of pool token
            const _d = (0, instructions_1.createApprovalInstruction)(owner, poolTokenAmount_U64, userPoolTokenPublicKey), { userTransferAuthority } = _d, transferPoolTokenInstruction = __rest(_d, ["userTransferAuthority"]);
            const withdrawInstruction = spl_token_swap_1.TokenSwap.withdrawAllTokenTypesInstruction(this.info.address, this.info.authority, userTransferAuthority.publicKey, this.info.poolTokenMint, this.info.feeAccount, userPoolTokenPublicKey, tokenA.addr, tokenB.addr, userTokenAPublicKey, userTokenBPublicKey, utils_1.PNG_TOKEN_SWAP_ID, spl_token_1.TOKEN_PROGRAM_ID, new spl_token_swap_1.Numberu64(poolTokenAmount_U64.toString()), new spl_token_swap_1.Numberu64(tokenAAmount.toString()), new spl_token_swap_1.Numberu64(tokenBAmount.toString()));
            return new utils_1.TransactionBuilder(this.provider)
                .addInstruction(resolveTokenAInstrucitons)
                .addInstruction(resolveTokenBInstrucitons)
                .addInstruction(resolvePoolTokenInstructions)
                .addInstruction(transferPoolTokenInstruction)
                .addInstruction({
                instructions: [withdrawInstruction],
                cleanupInstructions: [],
                signers: [userTransferAuthority]
            })
                .build();
        });
    }
}
exports.Pool = Pool;
