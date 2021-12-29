"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StablePoolQuoteBuilder = void 0;
const spl_token_1 = require("@solana/spl-token");
const web3_js_1 = require("@solana/web3.js");
const decimal_js_1 = __importDefault(require("decimal.js"));
const stablecurve_1 = require("@orca-so/stablecurve");
const utils_1 = require("../../utils");
const utils_2 = require("../../utils");
function getInputAmountLessFees(inputTradeAmount, params) {
    return inputTradeAmount.sub(getLPFees(inputTradeAmount, params));
}
function getOutputAmountWithNoSlippage(inputTradeAmountLessFees, params) {
    const [poolInputAmount, poolOutputAmount, amp] = [
        params.inputTokenCount,
        params.outputTokenCount,
        params.amp,
    ];
    return (0, stablecurve_1.computeBaseOutputAmount)(inputTradeAmountLessFees, poolInputAmount, poolOutputAmount, amp);
}
function getOutputAmount(inputTradeAmountLessFees, params) {
    const [poolInputAmount, poolOutputAmount, amp] = [
        params.inputTokenCount,
        params.outputTokenCount,
        params.amp,
    ];
    return (0, stablecurve_1.computeOutputAmount)(inputTradeAmountLessFees, poolInputAmount, poolOutputAmount, amp);
}
function getExpectedOutputAmountWithNoSlippage(inputTradeAmount, params) {
    const inputTradeAmountLessFees = getInputAmountLessFees(inputTradeAmount, params);
    return getOutputAmountWithNoSlippage(inputTradeAmountLessFees, params);
}
function getExpectedOutputAmount(inputTradeAmount, params) {
    const inputTradeAmountLessFees = getInputAmountLessFees(inputTradeAmount, params);
    return getOutputAmount(inputTradeAmountLessFees, params);
}
function getRate(inputTradeAmountU64, params) {
    if (inputTradeAmountU64.eq(utils_1.ZERO_U64)) {
        return new decimal_js_1.default(0);
    }
    const expectedOutputAmountU64 = getExpectedOutputAmount(inputTradeAmountU64, params);
    const inputTradeAmount = utils_1.DecimalUtil.fromU64(inputTradeAmountU64, params.inputToken.decimals);
    const outputTradeAmount = utils_1.DecimalUtil.fromU64(expectedOutputAmountU64, params.outputToken.decimals);
    return outputTradeAmount.div(inputTradeAmount).toDecimalPlaces(params.outputToken.decimals);
}
function getPriceImpact(inputTradeAmount, params) {
    if (inputTradeAmount.eq(utils_1.ZERO_U64) ||
        params.inputTokenCount.eq(utils_1.ZERO_U64) ||
        params.outputTokenCount.eq(utils_1.ZERO_U64)) {
        return new decimal_js_1.default(0);
    }
    const noSlippageOutputCountU64 = getExpectedOutputAmountWithNoSlippage(inputTradeAmount, params);
    const outputCountU64 = getExpectedOutputAmount(inputTradeAmount, params);
    const noSlippageOutputCount = utils_1.DecimalUtil.fromU64(noSlippageOutputCountU64, params.outputToken.decimals);
    const outputCount = utils_1.DecimalUtil.fromU64(outputCountU64, params.outputToken.decimals);
    const impact = noSlippageOutputCount.sub(outputCount).div(noSlippageOutputCount);
    return impact.mul(100).toDecimalPlaces(params.outputToken.decimals);
}
function getLPFees(inputTradeAmount, params) {
    const { feeStructure } = params;
    const tradingFee = feeStructure.tradeFeeNumerator === 0
        ? utils_1.ZERO_U64
        : inputTradeAmount
            .mul(new spl_token_1.u64(feeStructure.tradeFeeNumerator))
            .div(new spl_token_1.u64(feeStructure.tradeFeeDenominator));
    const ownerFee = feeStructure.tradeFeeNumerator === 0
        ? utils_1.ZERO_U64
        : inputTradeAmount
            .mul(new spl_token_1.u64(feeStructure.tradeFeeNumerator))
            .div(new spl_token_1.u64(feeStructure.tradeFeeDenominator));
    return new spl_token_1.u64(tradingFee.add(ownerFee).toString());
}
function getMinimumAmountOut(inputTradeAmount, params) {
    const expectedOutputAmount = getExpectedOutputAmount(inputTradeAmount, params);
    return expectedOutputAmount
        .mul(utils_1.ONE_THOUSAND_U64.sub(new spl_token_1.u64(params.slippage)))
        .div(utils_1.ONE_THOUSAND_U64);
}
function getNetworkFees(params) {
    let numSigs;
    if (new web3_js_1.PublicKey(params.inputToken.mint).equals(utils_2.SOL_TOKEN_MINT) ||
        new web3_js_1.PublicKey(params.outputToken.mint).equals(utils_2.SOL_TOKEN_MINT)) {
        numSigs = 3;
    }
    else {
        numSigs = 2;
    }
    return params.lamportsPerSignature * numSigs;
}
class StablePoolQuoteBuilder {
    buildQuote(params, inputTradeAmount) {
        if (!params.amp) {
            throw new Error("amp param required for stable pool");
        }
        return {
            getRate: () => getRate(inputTradeAmount, params),
            getPriceImpact: () => getPriceImpact(inputTradeAmount, params),
            getLPFees: () => getLPFees(inputTradeAmount, params),
            getNetworkFees: () => new spl_token_1.u64(getNetworkFees(params)),
            getExpectedOutputAmount: () => getExpectedOutputAmount(inputTradeAmount, params),
            getMinOutputAmount: () => getMinimumAmountOut(inputTradeAmount, params),
        };
    }
}
exports.StablePoolQuoteBuilder = StablePoolQuoteBuilder;
