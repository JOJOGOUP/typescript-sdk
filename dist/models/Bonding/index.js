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
const decimal_js_1 = __importDefault(require("decimal.js"));
const BONDING_SEED_PREFIX = 'bonding_authority';
class Bonding {
    constructor(provider, config) {
        this.config = config;
        this.program = new anchor_1.Program(idl_json_1.default, utils_1.PNG_BONDING_ID, provider);
    }
    getBondingInfo() {
        return __awaiter(this, void 0, void 0, function* () {
            const { payoutHolder, payoutTokenMint, depositHolder, depositTokenMint, bondingSupply, maxPayout, maxDebt, minPrice, totalDebt, controlVariable, decayFactor, lastDecay } = yield this.program.account.bonding.fetch(this.config.address);
            const depositHolderInfo = yield (0, utils_1.getTokenAccountInfo)(this.program.provider, depositHolder);
            return {
                address: this.config.address,
                payoutHolder,
                payoutTokenMint,
                depositHolder,
                depositTokenMint,
                depositHolderAmount: (depositHolderInfo === null || depositHolderInfo === void 0 ? void 0 : depositHolderInfo.amount) || utils_1.ZERO_U64,
                bondingSupply,
                maxPayout,
                maxDebt,
                minPrice,
                totalDebt,
                controlVariable: controlVariable.toNumber(),
                decayFactor: decayFactor.toNumber(),
                lastDecay: lastDecay.toNumber()
            };
        });
    }
    valueOf(amount, payoutTokenDecimals, depositTokenDecimals) {
        return amount
            .mul(new spl_token_1.u64(Math.pow(10, payoutTokenDecimals)))
            .div(new spl_token_1.u64(Math.pow(10, depositTokenDecimals)));
    }
    debtRatio(totalDebt, tokenSupply, payoutTokenDecimals) {
        return totalDebt
            .mul(new spl_token_1.u64(Math.pow(10, payoutTokenDecimals)))
            .div(tokenSupply);
    }
    price(bondingInfo, payoutTokenDecimals) {
        const { totalDebt, bondingSupply, controlVariable, minPrice } = bondingInfo;
        const debtRatio = this.debtRatio(totalDebt, bondingSupply, payoutTokenDecimals);
        const price = debtRatio
            .mul(new spl_token_1.u64(controlVariable))
            .div(new spl_token_1.u64(Math.pow(10, payoutTokenDecimals - 5)));
        return price.lt(minPrice) ? minPrice : price;
    }
    calcPayout(bondingInfo, payoutTokenDecimals, depositTokenDecimals, amount = 1) {
        const valuation = this.valueOf(utils_1.DecimalUtil.toU64(new decimal_js_1.default(amount), depositTokenDecimals), payoutTokenDecimals, depositTokenDecimals);
        const price = this.price(bondingInfo, payoutTokenDecimals);
        const payout = valuation.mul(new spl_token_1.u64(Math.pow(10, 5))).div(price);
        return {
            payoutAmount: payout,
            internalPrice: price
        };
    }
    bond(amount) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const owner = (_a = this.program.provider.wallet) === null || _a === void 0 ? void 0 : _a.publicKey;
            const bondingInfo = yield this.getBondingInfo();
            const [bondingPda] = yield web3_js_1.PublicKey.findProgramAddress([Buffer.from(BONDING_SEED_PREFIX), this.config.address.toBuffer()], this.program.programId);
            const userDepositHolder = yield (0, utils_1.deriveAssociatedTokenAddress)(owner, bondingInfo.depositTokenMint);
            const _b = yield (0, utils_1.resolveOrCreateAssociatedTokenAddress)(this.program.provider.connection, owner, bondingInfo.payoutTokenMint, amount), { address: userPayoutHolder } = _b, resolveUserPayoutHolderInstrucitons = __rest(_b, ["address"]);
            const bondInstruction = this.program.instruction.bond(amount, new spl_token_1.u64(1e12), {
                accounts: {
                    bonding: this.config.address,
                    bondingPda,
                    depositTokenMint: bondingInfo.depositTokenMint,
                    depositHolder: bondingInfo.depositHolder,
                    payoutHolder: bondingInfo.payoutHolder,
                    payoutTokenMint: bondingInfo.payoutTokenMint,
                    userDepositHolder,
                    userPayoutHolder,
                    owner,
                    tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
                }
            });
            return new solana_contrib_1.TransactionEnvelope(this.program.provider, [
                ...resolveUserPayoutHolderInstrucitons.instructions,
                bondInstruction
            ], [
                ...resolveUserPayoutHolderInstrucitons.signers
            ]);
        });
    }
}
exports.Bonding = Bonding;
