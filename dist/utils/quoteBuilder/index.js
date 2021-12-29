"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuoteBuilderFactory = void 0;
const __1 = require("../");
const constant_product_quote_1 = require("./constant-product-quote");
const stable_quote_1 = require("./stable-quote");
class QuoteBuilderFactory {
    static getBuilder(curveType) {
        switch (curveType) {
            case __1.CurveType.ConstantProduct:
                return new constant_product_quote_1.ConstantProductPoolQuoteBuilder();
            case __1.CurveType.Stable:
                return new stable_quote_1.StablePoolQuoteBuilder();
            default:
                return undefined;
        }
    }
}
exports.QuoteBuilderFactory = QuoteBuilderFactory;
