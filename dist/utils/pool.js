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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTokenPercent = exports.computeRate = exports.getTokenPriceViaPools = exports.computeLPPrice = exports.getPoolInfo = void 0;
const web3_js_1 = require("@solana/web3.js");
const _1 = require(".");
const spl_token_1 = require("@solana/spl-token");
const spl_token_swap_1 = require("@solana/spl-token-swap");
const emptyToken = {
    symbol: '',
    mint: '',
    name: '',
    decimals: 1
};
const emptyPool = {
    address: web3_js_1.PublicKey.default,
    nonce: 0,
    authority: web3_js_1.PublicKey.default,
    poolTokenMint: web3_js_1.PublicKey.default,
    poolTokenDecimals: 1,
    feeAccount: web3_js_1.PublicKey.default,
    curveType: _1.CurveType.ConstantProduct,
    feeStructure: {
        tradeFeeNumerator: 0,
        tradeFeeDenominator: 0,
        ownerTradeFeeNumerator: 0,
        ownerTradeFeeDenominator: 0,
        ownerWithdrawFeeNumerator: 0,
        ownerWithdrawFeeDenominator: 0
    },
    tokenA: Object.assign(Object.assign({}, emptyToken), { addr: web3_js_1.PublicKey.default, amount: _1.ZERO_U64 }),
    tokenB: Object.assign(Object.assign({}, emptyToken), { addr: web3_js_1.PublicKey.default, amount: _1.ZERO_U64 }),
    lpSupply: _1.ZERO_DECIMAL
};
function getPoolInfo(connection, poolAddr, tokens) {
    return __awaiter(this, void 0, void 0, function* () {
        const poolAccountInfo = yield connection.getAccountInfo(poolAddr);
        if (!poolAccountInfo) {
            return emptyPool;
        }
        const decodedInfo = spl_token_swap_1.TokenSwapLayout.decode(Buffer.from(poolAccountInfo.data));
        const poolMint = new web3_js_1.PublicKey(decodedInfo.tokenPool);
        const feeAccount = new web3_js_1.PublicKey(decodedInfo.feeAccount);
        const tokenAccountA = new web3_js_1.PublicKey(decodedInfo.tokenAccountA);
        const tokenAccountB = new web3_js_1.PublicKey(decodedInfo.tokenAccountB);
        const mintA = new web3_js_1.PublicKey(decodedInfo.mintA);
        const mintB = new web3_js_1.PublicKey(decodedInfo.mintB);
        const nonce = decodedInfo.nonce;
        const tradeFeeNumerator = spl_token_swap_1.Numberu64.fromBuffer(decodedInfo.tradeFeeNumerator);
        const tradeFeeDenominator = spl_token_swap_1.Numberu64.fromBuffer(decodedInfo.tradeFeeDenominator);
        const ownerTradeFeeNumerator = spl_token_swap_1.Numberu64.fromBuffer(decodedInfo.ownerTradeFeeNumerator);
        const ownerTradeFeeDenominator = spl_token_swap_1.Numberu64.fromBuffer(decodedInfo.ownerTradeFeeDenominator);
        const ownerWithdrawFeeNumerator = spl_token_swap_1.Numberu64.fromBuffer(decodedInfo.ownerWithdrawFeeNumerator);
        const ownerWithdrawFeeDenominator = spl_token_swap_1.Numberu64.fromBuffer(decodedInfo.ownerWithdrawFeeDenominator);
        const curveType = decodedInfo.curveType;
        const poolToken = new spl_token_1.Token(connection, poolMint, spl_token_1.TOKEN_PROGRAM_ID, {});
        const poolTokenInfo = yield poolToken.getMintInfo();
        // TODO: Batch request?
        const accountInfos = yield Promise.all([
            connection.getAccountInfo(tokenAccountA),
            connection.getAccountInfo(tokenAccountB),
        ]);
        const [tokenAccountAInfo, tokenAccountBInfo] = accountInfos.map((info) => info ? (0, _1.deserializeAccount)(info.data) : null);
        const lpSupplyInfo = yield connection.getTokenSupply(poolMint);
        const tokenA = (0, _1.getTokenByMint)(mintA.toString(), tokens);
        const tokenB = (0, _1.getTokenByMint)(mintB.toString(), tokens);
        return {
            address: poolAddr,
            nonce,
            authority: poolTokenInfo.mintAuthority || web3_js_1.PublicKey.default,
            poolTokenMint: poolMint,
            poolTokenDecimals: poolTokenInfo.decimals,
            feeAccount: feeAccount,
            lpSupply: _1.DecimalUtil.fromString(lpSupplyInfo.value.amount, poolTokenInfo.decimals),
            tokenA: Object.assign(Object.assign({}, (tokenA || emptyToken)), { addr: tokenAccountA, amount: tokenAccountAInfo ? new spl_token_1.u64(tokenAccountAInfo.amount) : _1.ZERO_U64 }),
            tokenB: Object.assign(Object.assign({}, (tokenB || emptyToken)), { addr: tokenAccountB, amount: tokenAccountBInfo ? new spl_token_1.u64(tokenAccountBInfo.amount) : _1.ZERO_U64 }),
            curveType,
            feeStructure: {
                tradeFeeNumerator: tradeFeeNumerator.toNumber(),
                tradeFeeDenominator: tradeFeeDenominator.toNumber(),
                ownerTradeFeeNumerator: ownerTradeFeeNumerator.toNumber(),
                ownerTradeFeeDenominator: ownerTradeFeeDenominator.toNumber(),
                ownerWithdrawFeeNumerator: ownerWithdrawFeeNumerator.toNumber(),
                ownerWithdrawFeeDenominator: ownerWithdrawFeeDenominator.toNumber()
            }
        };
    });
}
exports.getPoolInfo = getPoolInfo;
function computeLPPrice(pool, prices) {
    const { tokenA, tokenB, lpSupply } = pool;
    const inputTokenCount = _1.DecimalUtil.fromU64(tokenA.amount, tokenA.decimals).toNumber();
    const outputTokenCount = _1.DecimalUtil.fromU64(tokenB.amount, tokenB.decimals).toNumber();
    const a2brate = outputTokenCount / inputTokenCount;
    let priceA = prices[tokenA.symbol] || 0, priceB = prices[tokenB.symbol] || 0;
    if (priceA && !priceB) {
        priceB = priceA / a2brate;
    }
    else if (priceB && !priceA) {
        priceA = priceB * a2brate;
    }
    const totalValue = inputTokenCount * priceA + outputTokenCount * priceB;
    return totalValue / lpSupply.toNumber();
}
exports.computeLPPrice = computeLPPrice;
function getTokenPriceViaPools(tokenSymbol, poolInfos, prices) {
    const pool = poolInfos.find(pool => (pool.tokenA.symbol || pool.tokenB.symbol) === tokenSymbol);
    if (!pool) {
        return 0;
    }
    const { tokenA, tokenB } = pool;
    const inputTokenCount = _1.DecimalUtil.fromU64(tokenA.amount, tokenA.decimals).toNumber();
    const outputTokenCount = _1.DecimalUtil.fromU64(tokenB.amount, tokenB.decimals).toNumber();
    const a2brate = outputTokenCount / inputTokenCount;
    let priceA = prices[tokenA.symbol] || 0, priceB = prices[tokenB.symbol] || 0;
    if (priceA && !priceB) {
        priceB = priceA / a2brate;
    }
    else if (priceB && !priceA) {
        priceA = priceB * a2brate;
    }
    return tokenSymbol === tokenA.symbol ? priceA : priceB;
}
exports.getTokenPriceViaPools = getTokenPriceViaPools;
function computeRate(pool, inputToken) {
    const { tokenA, tokenB } = pool;
    const forward = inputToken ? inputToken.mint === tokenA.mint : true;
    const inputTokenCount = forward ? tokenA.amount : tokenB.amount;
    const outputTokenCount = forward ? tokenB.amount : tokenA.amount;
    return _1.DecimalUtil
        .fromU64(outputTokenCount, (forward ? tokenB : tokenA).decimals)
        .div(_1.DecimalUtil.fromU64(inputTokenCount, (forward ? tokenA : tokenB).decimals)).toNumber();
}
exports.computeRate = computeRate;
function getTokenPercent(pool) {
    const { tokenA, tokenB } = pool;
    return {
        tokenAPercent: _1.DecimalUtil
            .fromU64(tokenA.amount, tokenA.decimals)
            .mul(_1.ONE_HUNDRED_DECIMAL)
            .div(_1.DecimalUtil
            .fromU64(tokenA.amount, tokenA.decimals)
            .add(_1.DecimalUtil
            .fromU64(tokenB.amount, tokenB.decimals))).toNumber(),
        tokenBPercent: _1.DecimalUtil
            .fromU64(tokenB.amount, tokenB.decimals)
            .mul(_1.ONE_HUNDRED_DECIMAL)
            .div(_1.DecimalUtil
            .fromU64(tokenA.amount, tokenA.decimals)
            .add(_1.DecimalUtil
            .fromU64(tokenB.amount, tokenB.decimals))).toNumber()
    };
}
exports.getTokenPercent = getTokenPercent;
