"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPairByPoolInfo = exports.toShortAddr = exports.getTokenBySymbol = exports.getTokenByMint = exports.toFixed = exports.beautify = exports.isNumber = exports.ONE_THOUSAND_U64 = exports.ONE_HUNDRED_U64 = exports.ONE_U64 = exports.ZERO_U64 = void 0;
const decimal_js_1 = __importDefault(require("decimal.js"));
const spl_token_1 = require("@solana/spl-token");
exports.ZERO_U64 = new spl_token_1.u64(0);
exports.ONE_U64 = new spl_token_1.u64(1);
exports.ONE_HUNDRED_U64 = new spl_token_1.u64(100);
exports.ONE_THOUSAND_U64 = new spl_token_1.u64(1000);
function isNumber(value) {
    const reg = /^[0-9]+\.?[0-9]*$/;
    return reg.test(value);
}
exports.isNumber = isNumber;
function beautify(str = '') {
    const reg = str.indexOf('.') > -1 ? /(\d)(?=(\d{3})+\.)/g : /(\d)(?=(?:\d{3})+$)/g;
    str = str.replace(reg, '$1,');
    return str.replace(/(\.[0-9]+[1-9]+)(0)*/, '$1');
}
exports.beautify = beautify;
function toFixed(value = 0, fixed = 2, force = false) {
    const str = /\./.test(value.toString()) ? new decimal_js_1.default(value).toFixed(fixed, 1) :
        new decimal_js_1.default(value).toFixed(force ? fixed : 0, 1);
    return str.replace(/(\.[0-9]+[1-9]+)(0)*/, '$1');
}
exports.toFixed = toFixed;
function getTokenByMint(mint, tokens) {
    return tokens.find(t => t.mint === mint);
}
exports.getTokenByMint = getTokenByMint;
function getTokenBySymbol(symbol, tokens) {
    return tokens.find(t => t.symbol === symbol);
}
exports.getTokenBySymbol = getTokenBySymbol;
function toShortAddr(pubkey, length = 4) {
    if (typeof pubkey !== 'string') {
        pubkey = pubkey.toString();
    }
    return `${pubkey.substr(0, length)}...${pubkey.substr(-length)}`;
}
exports.toShortAddr = toShortAddr;
const getPairByPoolInfo = (info) => {
    const pair = info.tokenA.symbol + '_' + info.tokenB.symbol;
    return pair;
};
exports.getPairByPoolInfo = getPairByPoolInfo;
