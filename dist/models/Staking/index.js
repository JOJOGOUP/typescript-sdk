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
exports.Staking = void 0;
const utils_1 = require("../../utils");
const spl_token_1 = require("@solana/spl-token");
const web3_js_1 = require("@solana/web3.js");
const idl_json_1 = __importDefault(require("./idl.json"));
const vesting_json_1 = __importDefault(require("./vesting.json"));
const anchor_1 = require("@project-serum/anchor");
const solana_contrib_1 = require("@saberhq/solana-contrib");
const STAKING_SEED_PREFIX = 'staking_authority';
const VESTING_SEED_PREFIX = 'vesting';
const VESTING_SIGNER_SEED_PREFIX = 'vesting_signer';
const VESTING_CONFIG_SIGNER_SEED_PREFIX = 'vest_config_signer';
class Staking {
    constructor(provider, config) {
        this.config = config;
        this.program = new anchor_1.Program(idl_json_1.default, utils_1.PNG_STAKING_ID, provider);
        this.vestingProgram = new anchor_1.Program(vesting_json_1.default, utils_1.PNG_VESTING_ID, provider);
    }
    getUserVestingAddress() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const owner = ((_a = this.program.provider.wallet) === null || _a === void 0 ? void 0 : _a.publicKey) || web3_js_1.PublicKey.default;
            const [userVestingAddr] = yield web3_js_1.PublicKey.findProgramAddress([Buffer.from(VESTING_SEED_PREFIX), this.config.vestConfig.toBuffer(), owner.toBuffer()], this.vestingProgram.programId);
            return userVestingAddr;
        });
    }
    getVestingInfo(addr) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const vesting = yield this.vestingProgram.account.vesting.fetch(addr);
                return vesting;
            }
            catch (err) {
                return null;
            }
        });
    }
    getVestConfigInfo() {
        return __awaiter(this, void 0, void 0, function* () {
            const { vestMint, claimAllDuration, halfLifeDuration, claimableHolder, claimableMint } = yield this.vestingProgram.account.vestConfig.fetch(this.config.vestConfig);
            return {
                vestMint,
                claimAllDuration: claimAllDuration.toNumber(),
                halfLifeDuration: halfLifeDuration.toNumber(),
                claimableHolder,
                claimableMint
            };
        });
    }
    getStakingInfo() {
        return __awaiter(this, void 0, void 0, function* () {
            const { tokenMint, stakeTokenMint, tokenHolder, rebaseEpochDuration, rebaseLastTime, rebaseRateNumerator, rebaseRateDenominator, rewardsHolder, rebaseSupply } = yield this.program.account.staking.fetch(this.config.address);
            const tokenHolderInfo = yield (0, utils_1.getTokenAccountInfo)(this.program.provider, tokenHolder);
            return {
                tokenMint,
                sTokenMint: stakeTokenMint,
                tokenHolder,
                payoutTokenMint: this.config.payoutAsset,
                tokenHolderAmount: (tokenHolderInfo === null || tokenHolderInfo === void 0 ? void 0 : tokenHolderInfo.amount) || utils_1.ZERO_U64,
                rebaseEpochDuration: rebaseEpochDuration.toNumber(),
                rebaseLastTime: rebaseLastTime.toNumber(),
                rebaseRateNumerator: rebaseRateNumerator.toNumber(),
                rebaseRateDenominator: rebaseRateDenominator.toNumber(),
                rewardsHolder,
                rebaseSupply
            };
        });
    }
    toVToken(amount) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const owner = (_a = this.vestingProgram.provider.wallet) === null || _a === void 0 ? void 0 : _a.publicKey;
            const vestConfigInfo = yield this.getVestConfigInfo();
            const [vcSigner, _] = yield web3_js_1.PublicKey.findProgramAddress([Buffer.from(VESTING_CONFIG_SIGNER_SEED_PREFIX), this.config.vestConfig.toBuffer()], this.vestingProgram.programId);
            const [claimableHolder, userTokenAccount] = yield Promise.all([
                (0, utils_1.deriveAssociatedTokenAddress)(vcSigner, vestConfigInfo.claimableMint),
                (0, utils_1.deriveAssociatedTokenAddress)(owner, vestConfigInfo.claimableMint)
            ]);
            const _b = yield (0, utils_1.resolveOrCreateAssociatedTokenAddress)(this.vestingProgram.provider.connection, owner, vestConfigInfo.vestMint, amount), { address: userVTokenAccount } = _b, resolveUserVTokenAccountInstrucitons = __rest(_b, ["address"]);
            const instruction = this.vestingProgram.instruction.stake(amount, {
                accounts: {
                    vestConfig: this.config.vestConfig,
                    vestConfigSigner: vcSigner,
                    vestMint: vestConfigInfo.vestMint,
                    claimableHolder,
                    userClaimableHolder: userTokenAccount,
                    userVestHolder: userVTokenAccount,
                    owner,
                    tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
                },
            });
            return new solana_contrib_1.TransactionEnvelope(this.vestingProgram.provider, [
                ...resolveUserVTokenAccountInstrucitons.instructions,
                instruction
            ], [
                ...resolveUserVTokenAccountInstrucitons.signers
            ]);
        });
    }
    vestAll() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const owner = (_a = this.program.provider.wallet) === null || _a === void 0 ? void 0 : _a.publicKey;
            const instructions = [];
            const [userVestingAddress, vestConfigInfo] = yield Promise.all([
                this.getUserVestingAddress(),
                this.getVestConfigInfo()
            ]);
            const userVestingInfo = yield this.getVestingInfo(userVestingAddress);
            const [vSigner, vNonce] = yield web3_js_1.PublicKey.findProgramAddress([Buffer.from(VESTING_SIGNER_SEED_PREFIX), userVestingAddress.toBuffer()], this.vestingProgram.programId);
            const [vestedHolder, userVestHolder] = yield Promise.all([
                (0, utils_1.deriveAssociatedTokenAddress)(vSigner, vestConfigInfo.vestMint),
                (0, utils_1.deriveAssociatedTokenAddress)(owner, vestConfigInfo.vestMint)
            ]);
            // if user not have vesting, init it.
            if (userVestingInfo === null) {
                instructions.push(this.vestingProgram.instruction.initVesting(new spl_token_1.u64(vNonce), {
                    accounts: {
                        vestConfig: this.config.vestConfig,
                        vesting: userVestingAddress,
                        vestMint: vestConfigInfo.vestMint,
                        vestedHolder,
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
            // upodate vest
            instructions.push(this.vestingProgram.instruction.update({
                accounts: {
                    vestConfig: this.config.vestConfig,
                    vesting: userVestingAddress,
                    vestedHolder,
                    vestMint: vestConfigInfo.vestMint,
                    vestingSigner: vSigner,
                    owner,
                    clock: web3_js_1.SYSVAR_CLOCK_PUBKEY,
                    tokenProgram: spl_token_1.TOKEN_PROGRAM_ID
                }
            }));
            // vest all
            instructions.push(this.vestingProgram.instruction.vestAll({
                accounts: {
                    vesting: userVestingAddress,
                    vestedHolder,
                    userVestHolder,
                    owner,
                    clock: web3_js_1.SYSVAR_CLOCK_PUBKEY,
                    tokenProgram: spl_token_1.TOKEN_PROGRAM_ID
                }
            }));
            return new solana_contrib_1.TransactionEnvelope(this.program.provider, [
                ...instructions
            ], []);
        });
    }
    stake(amount) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const stakingInfo = yield this.getStakingInfo();
            const [stakingPda] = yield web3_js_1.PublicKey.findProgramAddress([Buffer.from(STAKING_SEED_PREFIX), this.config.address.toBuffer()], this.program.programId);
            const owner = (_a = this.program.provider.wallet) === null || _a === void 0 ? void 0 : _a.publicKey;
            const stakedHolder = yield (0, utils_1.deriveAssociatedTokenAddress)(stakingPda, stakingInfo.tokenMint);
            const userTokenHolder = yield (0, utils_1.deriveAssociatedTokenAddress)(owner, stakingInfo.tokenMint);
            const _b = yield (0, utils_1.resolveOrCreateAssociatedTokenAddress)(this.program.provider.connection, owner, stakingInfo.sTokenMint), { address: userSTokenHolder } = _b, resolveUserSTokenAccountInstrucitons = __rest(_b, ["address"]);
            const stakeInstruction = this.program.instruction.stake(amount, {
                accounts: {
                    staking: this.config.address,
                    stakingPda,
                    stakeTokenMint: stakingInfo.sTokenMint,
                    tokenHolder: stakedHolder,
                    userTokenHolder,
                    userStakeTokenHolder: userSTokenHolder,
                    owner,
                    tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
                },
            });
            return new solana_contrib_1.TransactionEnvelope(this.program.provider, [
                ...resolveUserSTokenAccountInstrucitons.instructions,
                stakeInstruction
            ], [
                ...resolveUserSTokenAccountInstrucitons.signers
            ]);
        });
    }
    stakeAll() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const stakingInfo = yield this.getStakingInfo();
            const [stakingPda] = yield web3_js_1.PublicKey.findProgramAddress([Buffer.from(STAKING_SEED_PREFIX), this.config.address.toBuffer()], this.program.programId);
            const owner = (_a = this.program.provider.wallet) === null || _a === void 0 ? void 0 : _a.publicKey;
            const stakedHolder = yield (0, utils_1.deriveAssociatedTokenAddress)(stakingPda, stakingInfo.tokenMint);
            const userTokenHolder = yield (0, utils_1.deriveAssociatedTokenAddress)(owner, stakingInfo.tokenMint);
            const _b = yield (0, utils_1.resolveOrCreateAssociatedTokenAddress)(this.program.provider.connection, owner, stakingInfo.sTokenMint), { address: userSTokenHolder } = _b, resolveUserSTokenAccountInstrucitons = __rest(_b, ["address"]);
            const stakeInstruction = this.program.instruction.stackAll({
                accounts: {
                    staking: this.config.address,
                    stakingPda,
                    stakeTokenMint: stakingInfo.sTokenMint,
                    tokenHolder: stakedHolder,
                    userTokenHolder,
                    userStakeTokenHolder: userSTokenHolder,
                    owner,
                    tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
                },
            });
            return new solana_contrib_1.TransactionEnvelope(this.program.provider, [
                ...resolveUserSTokenAccountInstrucitons.instructions,
                stakeInstruction
            ], [
                ...resolveUserSTokenAccountInstrucitons.signers
            ]);
        });
    }
    unvestAll() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const vestingAddr = yield this.getUserVestingAddress();
            const [vSigner] = yield web3_js_1.PublicKey.findProgramAddress([Buffer.from(VESTING_SIGNER_SEED_PREFIX), vestingAddr.toBuffer()], this.vestingProgram.programId);
            const owner = (_a = this.program.provider.wallet) === null || _a === void 0 ? void 0 : _a.publicKey;
            const vestConfigInfo = yield this.getVestConfigInfo();
            const [vestedHolder, userVestHolder] = yield Promise.all([
                (0, utils_1.deriveAssociatedTokenAddress)(vSigner, vestConfigInfo.vestMint),
                (0, utils_1.deriveAssociatedTokenAddress)(owner, vestConfigInfo.vestMint),
            ]);
            const updateInstruction = this.vestingProgram.instruction.update({
                accounts: {
                    vestConfig: this.config.vestConfig,
                    vesting: vestingAddr,
                    vestedHolder,
                    vestMint: vestConfigInfo.vestMint,
                    vestingSigner: vSigner,
                    owner,
                    clock: web3_js_1.SYSVAR_CLOCK_PUBKEY,
                    tokenProgram: spl_token_1.TOKEN_PROGRAM_ID
                }
            });
            const unvestInstruction = this.vestingProgram.instruction.unvestAll({
                accounts: {
                    vestedHolder,
                    vesting: vestingAddr,
                    vestingSigner: vSigner,
                    userVestHolder,
                    owner,
                    clock: web3_js_1.SYSVAR_CLOCK_PUBKEY,
                    tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
                }
            });
            return new solana_contrib_1.TransactionEnvelope(this.program.provider, [
                updateInstruction,
                unvestInstruction
            ], []);
        });
    }
    unstake(amount) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const stakeConfigInfo = yield this.getStakingInfo();
            const [stakingPda] = yield web3_js_1.PublicKey.findProgramAddress([Buffer.from(STAKING_SEED_PREFIX), this.config.address.toBuffer()], this.program.programId);
            const owner = (_a = this.program.provider.wallet) === null || _a === void 0 ? void 0 : _a.publicKey;
            const [stakedHolder, userTokenHolder, userSTokenHolder] = yield Promise.all([
                (0, utils_1.deriveAssociatedTokenAddress)(stakingPda, stakeConfigInfo.tokenMint),
                (0, utils_1.deriveAssociatedTokenAddress)(owner, stakeConfigInfo.tokenMint),
                (0, utils_1.deriveAssociatedTokenAddress)(owner, stakeConfigInfo.sTokenMint)
            ]);
            const unstakeInstruction = this.program.instruction.unstake(amount, {
                accounts: {
                    staking: this.config.address,
                    stakingPda,
                    stakeTokenMint: stakeConfigInfo.sTokenMint,
                    tokenHolder: stakedHolder,
                    userTokenHolder,
                    userStakeTokenHolder: userSTokenHolder,
                    owner,
                    tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
                },
            });
            return new solana_contrib_1.TransactionEnvelope(this.program.provider, [
                unstakeInstruction
            ], []);
        });
    }
    claimVestedToken(tokenMint) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const owner = (_a = this.program.provider.wallet) === null || _a === void 0 ? void 0 : _a.publicKey;
            const [vestingAddr, vestConfigInfo] = yield Promise.all([
                this.getUserVestingAddress(),
                this.getVestConfigInfo()
            ]);
            const [vcSigner] = yield web3_js_1.PublicKey.findProgramAddress([Buffer.from(VESTING_CONFIG_SIGNER_SEED_PREFIX), this.config.vestConfig.toBuffer()], this.vestingProgram.programId);
            const [vSigner] = yield web3_js_1.PublicKey.findProgramAddress([Buffer.from(VESTING_SIGNER_SEED_PREFIX), vestingAddr.toBuffer()], this.vestingProgram.programId);
            const [claimableHolder, vestedHolder] = yield Promise.all([
                (0, utils_1.deriveAssociatedTokenAddress)(vcSigner, tokenMint),
                (0, utils_1.deriveAssociatedTokenAddress)(vSigner, vestConfigInfo.vestMint)
            ]);
            const _b = yield (0, utils_1.resolveOrCreateAssociatedTokenAddress)(this.vestingProgram.provider.connection, owner, tokenMint), { address: userTokenHolder } = _b, resolveUserTokenAccountInstrucitons = __rest(_b, ["address"]);
            const updateInstruction = this.vestingProgram.instruction.update({
                accounts: {
                    vestConfig: this.config.vestConfig,
                    vesting: vestingAddr,
                    vestedHolder,
                    vestMint: vestConfigInfo.vestMint,
                    vestingSigner: vSigner,
                    owner,
                    clock: web3_js_1.SYSVAR_CLOCK_PUBKEY,
                    tokenProgram: spl_token_1.TOKEN_PROGRAM_ID
                }
            });
            const claimInstruction = this.vestingProgram.instruction.claim({
                accounts: {
                    vestConfig: this.config.vestConfig,
                    vestConfigSigner: vcSigner,
                    claimableHolder,
                    vesting: vestingAddr,
                    userClaimableHolder: userTokenHolder,
                    owner,
                    clock: web3_js_1.SYSVAR_CLOCK_PUBKEY,
                    tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
                },
                instructions: [updateInstruction]
            });
            return new solana_contrib_1.TransactionEnvelope(this.vestingProgram.provider, [
                ...resolveUserTokenAccountInstrucitons.instructions,
                updateInstruction,
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
exports.Staking = Staking;
