"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConstantProductPoolQuoteBuilder = void 0;
const spl_token_1 = require("@solana/spl-token");
const decimal_js_1 = __importDefault(require("decimal.js"));
const web3_js_1 = require("@solana/web3.js");
const __1 = require("../");
const common_1 = require("../common");
const constants_1 = require("../constants");
/**
 * ConstantProductPools
 *
 * Product price curve:
 * x = inputTokenCount
 * y = outputTokenCount
 * k =  x * y
 */
function ceilingDivision(dividend, divisor) {
    let quotient = dividend.div(divisor);
    if (quotient.eq(__1.ZERO_U64)) {
        return [__1.ZERO_U64, divisor];
    }
    let remainder = dividend.mod(divisor);
    if (remainder.gt(__1.ZERO_U64)) {
        quotient = quotient.add(__1.ONE_U64);
        divisor = dividend.div(quotient);
        remainder = dividend.mod(quotient);
        if (remainder.gt(__1.ZERO_U64)) {
            divisor = divisor.add(__1.ONE_U64);
        }
    }
    return [quotient, divisor];
}
function getRate(inputTradeAmountU64, params) {
    if (inputTradeAmountU64.eq(__1.ZERO_U64)) {
        return new decimal_js_1.default(0);
    }
    const expectedOutputAmountU64 = getExpectedOutputAmount(inputTradeAmountU64, params);
    const inputTradeAmount = __1.DecimalUtil.fromU64(inputTradeAmountU64, params.inputToken.decimals);
    const outputTradeAmount = __1.DecimalUtil.fromU64(expectedOutputAmountU64, params.outputToken.decimals);
    return outputTradeAmount.div(inputTradeAmount).toDecimalPlaces(params.outputToken.decimals);
}
function getPriceImpact(inputTradeAmount, params) {
    if (inputTradeAmount.eq(__1.ZERO_U64) || params.outputTokenCount.eq(__1.ZERO_U64)) {
        return new decimal_js_1.default(0);
    }
    const noSlippageOutputCountU64 = getExpectedOutputAmountWithNoSlippage(inputTradeAmount, params);
    const outputCountU64 = getExpectedOutputAmount(inputTradeAmount, params);
    const noSlippageOutputCount = __1.DecimalUtil.fromU64(noSlippageOutputCountU64, params.outputToken.decimals);
    const outputCount = __1.DecimalUtil.fromU64(outputCountU64, params.outputToken.decimals);
    const impact = noSlippageOutputCount.sub(outputCount).div(noSlippageOutputCount);
    return impact.mul(100).toDecimalPlaces(params.outputToken.decimals);
}
function getLPFees(inputTradeAmount, params) {
    const { feeStructure } = params;
    const tradingFee = inputTradeAmount
        .mul(new spl_token_1.u64(feeStructure.tradeFeeNumerator))
        .div(new spl_token_1.u64(feeStructure.tradeFeeDenominator));
    // const ownerFee = 
    //   feeStructure.ownerTradeFee.numerator.gt(ZERO_U64) && 
    //   feeStructure.ownerTradeFee.denominator.gt(ZERO_U64) ?
    //   inputTradeAmount
    //   .mul(feeStructure.ownerTradeFee.numerator)
    //   .div(feeStructure.ownerTradeFee.denominator) : ZERO_U64;
    return new spl_token_1.u64(tradingFee.toString());
}
function getExpectedOutputAmount(inputTradeAmount, params) {
    const inputTradeLessFees = inputTradeAmount.sub(getLPFees(inputTradeAmount, params));
    return getOutputAmount(inputTradeLessFees, params);
}
function getExpectedOutputAmountWithNoSlippage(inputTradeAmount, params) {
    if (params.inputTokenCount.eq(__1.ZERO_U64)) {
        return params.outputTokenCount;
    }
    const inputTradeLessFees = inputTradeAmount.sub(getLPFees(inputTradeAmount, params));
    return inputTradeLessFees.mul(params.outputTokenCount).div(params.inputTokenCount);
}
function getMinimumAmountOut(inputTradeAmount, params) {
    const expectedOutputAmountFees = getExpectedOutputAmount(inputTradeAmount, params);
    const result = expectedOutputAmountFees
        .mul(common_1.ONE_THOUSAND_U64.sub(new spl_token_1.u64(params.slippage)))
        .div(common_1.ONE_THOUSAND_U64);
    return result;
}
// Note: This function matches the calculation done on SERUM and on Web UI.
// Given k = currInputTokenCount * currOutputTokenCount and k = newInputTokenCount * newOutputTokenCount,
// solve for newOutputTokenCount
function getOutputAmount(inputTradeAmount, params) {
    const [poolInputAmount, poolOutputAmount] = [params.inputTokenCount, params.outputTokenCount];
    const invariant = poolInputAmount.mul(poolOutputAmount);
    const [newPoolOutputAmount] = ceilingDivision(invariant, poolInputAmount.add(inputTradeAmount));
    const outputAmount = poolOutputAmount.sub(newPoolOutputAmount);
    return new spl_token_1.u64(outputAmount.toString());
}
function getNetworkFees(params) {
    let numSigs;
    if (new web3_js_1.PublicKey(params.inputToken.mint).equals(constants_1.SOL_TOKEN_MINT) ||
        new web3_js_1.PublicKey(params.outputToken.mint).equals(constants_1.SOL_TOKEN_MINT)) {
        numSigs = 3;
    }
    else {
        numSigs = 2;
    }
    return params.lamportsPerSignature * numSigs;
}
class ConstantProductPoolQuoteBuilder {
    buildQuote(params, inputTradeAmount) {
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
exports.ConstantProductPoolQuoteBuilder = ConstantProductPoolQuoteBuilder;
