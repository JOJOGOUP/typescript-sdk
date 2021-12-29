"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DecimalUtil = exports.ONE_HUNDRED_DECIMAL = exports.ONE_DECIMAL = exports.ZERO_DECIMAL = void 0;
const spl_token_1 = require("@solana/spl-token");
const decimal_js_1 = __importDefault(require("decimal.js"));
const utils_1 = require("../utils");
exports.ZERO_DECIMAL = new decimal_js_1.default(0);
exports.ONE_DECIMAL = new decimal_js_1.default(1);
exports.ONE_HUNDRED_DECIMAL = new decimal_js_1.default(100);
class DecimalUtil {
    static fromString(input, shift = 0) {
        return new decimal_js_1.default(input || 0).div(new decimal_js_1.default(10).pow(shift));
    }
    static fromNumber(input, shift = 0) {
        return new decimal_js_1.default(input).div(new decimal_js_1.default(10).pow(shift));
    }
    static fromU64(input, shift = 0) {
        return new decimal_js_1.default(input.toString()).div(new decimal_js_1.default(10).pow(shift));
    }
    static toU64(input, shift = 0) {
        if (input.isNeg()) {
            throw new Error(`Negative decimal value ${input} cannot be converted to u64.`);
        }
        const shiftedValue = new spl_token_1.u64(input.mul(new decimal_js_1.default(10).pow(new decimal_js_1.default(shift))).toDecimalPlaces(0).toString());
        return shiftedValue;
    }
    static beautify(input, fixed) {
        if (!fixed) {
            fixed =
                input.eq(exports.ZERO_DECIMAL) ? 2 :
                    input.gt(exports.ZERO_DECIMAL) && input.lt(exports.ONE_DECIMAL) ? 6 :
                        input.gt(exports.ONE_DECIMAL) && input.lt(exports.ONE_HUNDRED_DECIMAL) ? 3 : 2;
        }
        const str = input.toFixed(fixed, 1);
        return (0, utils_1.beautify)(str);
    }
}
exports.DecimalUtil = DecimalUtil;
