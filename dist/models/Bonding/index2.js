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
exports.Bonding = void 0;
const utils_1 = require("../../utils");
const web3_js_1 = require("@solana/web3.js");
const spl_token_1 = require("@solana/spl-token");
const idl_json_1 = __importDefault(require("./idl.json"));
const anchor_1 = require("@project-serum/anchor");
const solana_contrib_1 = require("@saberhq/solana-contrib");
const BONDING_SEED_PREFIX = 'bonding_authority';
const VESTING_SEED_PREFIX = 'vesting';
const VESTING_AUTHORITY_SEED_PREFIX = 'vesting_authority';
class Bonding {
    constructor(provider, config) {
        this.config = config;
        this.program = new anchor_1.Program(idl_json_1.default, utils_1.PNG_BONDING_ID, provider);
    }
    getUserVestingAddress() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const owner = ((_a = this.program.provider.wallet) === null || _a === void 0 ? void 0 : _a.publicKey) || web3_js_1.PublicKey.default;
            const [userVestingAddr] = yield web3_js_1.PublicKey.findProgramAddress([Buffer.from(VESTING_SEED_PREFIX), this.config.addr.toBuffer(), owner.toBuffer()], this.program.programId);
            return userVestingAddr;
        });
    }
    getUserVesting() {
        return __awaiter(this, void 0, void 0, function* () {
            const userVestingAddr = yield this.getUserVestingAddress();
            try {
                const vesting = yield this.program.account.vesting.fetch(userVestingAddr);
                return vesting;
            }
            catch (err) {
                return null;
            }
        });
    }
    getBondingInfo() {
        return __awaiter(this, void 0, void 0, function* () {
            const { assetMint, tokenMintDecimals, assetHolder, lpInfo, vestConfig, lastDecay, decayFactor, controlVariable, totalDebt, bondingSupply } = yield this.program.account.bonding.fetch(this.config.addr);
            const assetHolderInfo = yield (0, utils_1.getTokenAccountInfo)(this.program.provider, assetHolder);
            return {
                address: this.config.addr,
                assetMint,
                assetMintDecimals: tokenMintDecimals,
                assetHolder,
                lpInfo,
                vestConfig: {
                    vestMint: vestConfig.vestMint,
                    claimAllDuration: vestConfig.claimAllDuration.toNumber(),
                    halfLifeDuration: vestConfig.halfLifeDuration.toNumber(),
                    claimableHolder: vestConfig.claimableHolder,
                    claimableMint: vestConfig.claimableMint
                },
                assetHolderAmount: assetHolderInfo ? utils_1.DecimalUtil.fromU64(assetHolderInfo.amount) : utils_1.ZERO_DECIMAL,
                lastDecay: lastDecay.toNumber(),
                decayFactor: decayFactor.toNumber(),
                controlVariable: controlVariable.toNumber(),
                totalDebt,
                bondingSupply
            };
        });
    }
    decay(bondingInfo) {
        const { lastDecay, totalDebt, decayFactor } = bondingInfo;
        const duration = Math.floor(new Date().getTime() / 1000 - lastDecay);
        const decay = totalDebt.mul(new spl_token_1.u64(duration)).div(new spl_token_1.u64(decayFactor));
        return decay.gt(totalDebt) ? totalDebt : decay;
    }
    valuation(bondingInfo, amount) {
        return __awaiter(this, void 0, void 0, function* () {
            const { vestConfig, assetMint, lpInfo } = bondingInfo;
            const [vTokenMintInfo, assetMintInfo, tokenAHolderInfo, tokenBHolderInfo] = yield Promise.all([
                (0, utils_1.getTokenMintInfo)(this.program.provider, vestConfig.vestMint),
                (0, utils_1.getTokenMintInfo)(this.program.provider, assetMint),
                lpInfo ? (0, utils_1.getTokenAccountInfo)(this.program.provider, lpInfo.tokenAHolder) : Promise.resolve(null),
                lpInfo ? (0, utils_1.getTokenAccountInfo)(this.program.provider, lpInfo.tokenBHolder) : Promise.resolve(null),
            ]);
            if (!lpInfo) {
                return amount.mul(new spl_token_1.u64(Math.pow(10, vTokenMintInfo.decimals)))
                    .div(new spl_token_1.u64(Math.pow(10, assetMintInfo.decimals)));
            }
            else {
                const { tokenADecimals, tokenBDecimals } = lpInfo;
                const decimals = tokenADecimals + tokenBDecimals - assetMintInfo.decimals;
                const tokenAAmount = (tokenAHolderInfo === null || tokenAHolderInfo === void 0 ? void 0 : tokenAHolderInfo.amount) || utils_1.ZERO_U64;
                const tokenBAmount = (tokenBHolderInfo === null || tokenBHolderInfo === void 0 ? void 0 : tokenBHolderInfo.amount) || utils_1.ZERO_U64;
                const kValue = tokenAAmount.mul(tokenBAmount).div(new spl_token_1.u64(Math.pow(10, decimals)));
                const totalValue = utils_1.DecimalUtil.fromU64(kValue).sqrt().mul(2);
                return utils_1.DecimalUtil.toU64(totalValue, assetMintInfo.decimals)
                    .mul(amount)
                    .div(new spl_token_1.u64(Math.pow(10, assetMintInfo.decimals)))
                    .div(assetMintInfo.supply);
            }
        });
    }
    calcPayout(amount) {
        return __awaiter(this, void 0, void 0, function* () {
            const bondingInfo = yield this.getBondingInfo();
            const { totalDebt, bondingSupply, controlVariable } = bondingInfo;
            const debtRatio = totalDebt
                .sub(this.decay(bondingInfo))
                .mul(new spl_token_1.u64(1e9))
                .div(bondingSupply);
            const price = debtRatio
                .mul(new spl_token_1.u64(controlVariable))
                .add(new spl_token_1.u64(1e9))
                .div(new spl_token_1.u64(1e7))
                .toNumber();
            const valuation = yield this.valuation(bondingInfo, amount);
            return valuation.mul(new spl_token_1.u64(100)).div(new spl_token_1.u64(price));
        });
    }
    purchaseToken(amount) {
        var _a, _b, _c;
        return __awaiter(this, void 0, void 0, function* () {
            const owner = (_a = this.program.provider.wallet) === null || _a === void 0 ? void 0 : _a.publicKey;
            const bondingInfo = yield this.getBondingInfo();
            const [bondingPda] = yield web3_js_1.PublicKey.findProgramAddress([Buffer.from(BONDING_SEED_PREFIX), this.config.addr.toBuffer()], this.program.programId);
            const vestingAddr = yield this.getUserVestingAddress();
            const [vSigner, vNonce] = yield web3_js_1.PublicKey.findProgramAddress([Buffer.from(VESTING_AUTHORITY_SEED_PREFIX), vestingAddr.toBuffer()], this.program.programId);
            const vestedHolder = yield (0, utils_1.deriveAssociatedTokenAddress)(vSigner, bondingInfo.vestConfig.vestMint);
            const userAssetHolder = yield (0, utils_1.deriveAssociatedTokenAddress)(owner, bondingInfo.assetMint);
            const _d = yield (0, utils_1.resolveOrCreateAssociatedTokenAddress)(this.program.provider.connection, owner, bondingInfo.vestConfig.vestMint, amount), { address: userVTokenHolder } = _d, resolveUserVTokenAccountInstrucitons = __rest(_d, ["address"]);
            const instructions = [];
            const userVesting = yield this.getUserVesting();
            if (userVesting === null) {
                instructions.push(this.program.instruction.initVesting(new spl_token_1.u64(vNonce), {
                    accounts: {
                        bonding: this.config.addr,
                        vesting: vestingAddr,
                        vestMint: bondingInfo.vestConfig.vestMint,
                        vestedHolder: vestedHolder,
                        vestingSigner: vSigner,
                        payer: owner,
                        rent: web3_js_1.SYSVAR_RENT_PUBKEY,
                        clock: web3_js_1.SYSVAR_CLOCK_PUBKEY,
                        systemProgram: web3_js_1.SystemProgram.programId,
                        tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
                        associatedTokenProgram: spl_token_1.ASSOCIATED_TOKEN_PROGRAM_ID,
                    }
                }));
            }
            else {
                instructions.push(this.program.instruction.updateVesting({
                    accounts: {
                        bonding: this.config.addr,
                        vesting: vestingAddr,
                        vestedHolder: vestedHolder,
                        vestMint: bondingInfo.vestConfig.vestMint,
                        vestSigner: vSigner,
                        owner,
                        clock: web3_js_1.SYSVAR_CLOCK_PUBKEY,
                        tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
                    }
                }));
            }
            instructions.push(!!bondingInfo.lpInfo ?
                this.program.instruction.purchaseWithLiquidity(amount, new spl_token_1.u64(1e10), {
                    accounts: {
                        bonding: this.config.addr,
                        bondingPda: bondingPda,
                        assetMint: bondingInfo.assetMint,
                        assetHolder: bondingInfo.assetHolder,
                        userAssetHolder: userAssetHolder,
                        tokenAHolder: (_b = bondingInfo.lpInfo) === null || _b === void 0 ? void 0 : _b.tokenAHolder,
                        tokenBHolder: (_c = bondingInfo.lpInfo) === null || _c === void 0 ? void 0 : _c.tokenBHolder,
                        vesting: vestingAddr,
                        vestMint: bondingInfo.vestConfig.vestMint,
                        vestedHolder,
                        vestSigner: vSigner,
                        owner,
                        rent: web3_js_1.SYSVAR_RENT_PUBKEY,
                        systemProgram: web3_js_1.SystemProgram.programId,
                        tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
                        associatedTokenProgram: spl_token_1.ASSOCIATED_TOKEN_PROGRAM_ID,
                    }
                }) :
                this.program.instruction.purchaseWithStable(amount, new spl_token_1.u64(1e10), {
                    accounts: {
                        bonding: this.config.addr,
                        bondingPda: bondingPda,
                        assetMint: bondingInfo.assetMint,
                        assetHolder: bondingInfo.assetHolder,
                        userAssetHolder: userAssetHolder,
                        vesting: vestingAddr,
                        vestMint: bondingInfo.vestConfig.vestMint,
                        vestedHolder,
                        vestSigner: vSigner,
                        owner,
                        rent: web3_js_1.SYSVAR_RENT_PUBKEY,
                        systemProgram: web3_js_1.SystemProgram.programId,
                        tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
                        associatedTokenProgram: spl_token_1.ASSOCIATED_TOKEN_PROGRAM_ID,
                    }
                }));
            return new solana_contrib_1.TransactionEnvelope(this.program.provider, [
                ...resolveUserVTokenAccountInstrucitons.instructions,
                ...instructions
            ], [
                ...resolveUserVTokenAccountInstrucitons.signers
            ]);
        });
    }
    claimVestedToken(tokenMint) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const bondingInfo = yield this.getBondingInfo();
            const owner = (_a = this.program.provider.wallet) === null || _a === void 0 ? void 0 : _a.publicKey;
            const vestingAddr = yield this.getUserVestingAddress();
            const [vSigner] = yield web3_js_1.PublicKey.findProgramAddress([Buffer.from(VESTING_AUTHORITY_SEED_PREFIX), vestingAddr.toBuffer()], this.program.programId);
            const [bondingPda] = yield web3_js_1.PublicKey.findProgramAddress([Buffer.from(BONDING_SEED_PREFIX), this.config.addr.toBuffer()], this.program.programId);
            const vestedHolder = yield (0, utils_1.deriveAssociatedTokenAddress)(vSigner, bondingInfo.vestConfig.vestMint);
            const claimableHolder = yield (0, utils_1.deriveAssociatedTokenAddress)(bondingPda, tokenMint);
            const _b = yield (0, utils_1.resolveOrCreateAssociatedTokenAddress)(this.program.provider.connection, owner, tokenMint), { address: userTokenHolder } = _b, resolveUserTokenAccountInstrucitons = __rest(_b, ["address"]);
            // const updateInstruction = this.program.instruction.update({
            //   accounts: {
            //     vestConfig: this.config.vestConfig,
            //     vesting: vestingAddr,
            //     vestedHolder,
            //     vestMint: bondingInfo.vTokenMint,
            //     vestingSigner: vSigner,
            //     owner,
            //     clock: SYSVAR_CLOCK_PUBKEY,
            //     tokenProgram: TOKEN_PROGRAM_ID,
            //   }
            // });
            const claimInstruction = this.program.instruction.claim({
                accounts: {
                    bonding: this.config.addr,
                    bondingPda: bondingPda,
                    claimableHolder: claimableHolder,
                    vesting: vestingAddr,
                    vestedHolder: vestedHolder,
                    vestMint: bondingInfo.vestConfig.vestMint,
                    vestSigner: vSigner,
                    userClaimableHolder: userTokenHolder,
                    owner,
                    clock: web3_js_1.SYSVAR_CLOCK_PUBKEY,
                    tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
                }
            });
            return new solana_contrib_1.TransactionEnvelope(this.program.provider, [
                ...resolveUserTokenAccountInstrucitons.instructions,
                claimInstruction
            ], [
                ...resolveUserTokenAccountInstrucitons.signers
            ]);
        });
    }
    static estimatedVestingClaimable(halfLifeDuration, claimAllDuration, vestedHolderAmount, lastUpdatedTime, lastVestTime, claimableAmount, updateTime //in seconds
    ) {
        //no more vested amount
        if (vestedHolderAmount.lte(utils_1.ZERO_U64)) {
            return claimableAmount;
        }
        // claimed all
        if (updateTime - lastVestTime > claimAllDuration) {
            return claimableAmount.add(vestedHolderAmount);
        }
        const timeElapsed = updateTime - lastUpdatedTime;
        const newRemainedAmount = utils_1.DecimalUtil.fromU64(vestedHolderAmount)
            .mul(utils_1.DecimalUtil.fromNumber(Math.exp((-Math.LN2 * timeElapsed) / halfLifeDuration)));
        const newClaimableAmount = utils_1.DecimalUtil.fromU64(vestedHolderAmount).sub(newRemainedAmount);
        return claimableAmount.add(utils_1.DecimalUtil.toU64(newClaimableAmount));
    }
}
exports.Bonding = Bonding;
