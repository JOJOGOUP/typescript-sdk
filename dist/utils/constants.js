"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CurveType = exports.PNG_TOKEN_SWAP_FEE_STRUCTURE = exports.SYSTEM_PROGRAM_ID = exports.SOL_TOKEN_MINT = exports.PNG_TOKEN_SWAP_FEE_ACCOUNT_OWNER = exports.PNG_STAKING_ID = exports.PNG_VESTING_ID = exports.PNG_BONDING_ID = exports.PNG_TOKEN_SWAP_ID = void 0;
const web3_js_1 = require("@solana/web3.js");
exports.PNG_TOKEN_SWAP_ID = new web3_js_1.PublicKey('PSwapMdSai8tjrEXcxFeQth87xC4rRsa4VA5mhGhXkP');
exports.PNG_BONDING_ID = new web3_js_1.PublicKey('PBondLKEdykMYSwuBZ7mQ5nWQtihdSynzUXNzKPTznh');
exports.PNG_VESTING_ID = new web3_js_1.PublicKey('PVeEcTWw5YuZih7848DGK5MRTTtaRpiimQntHd3NSND');
exports.PNG_STAKING_ID = new web3_js_1.PublicKey('PStkCKhx3A4oJdeCXspZeePgQcZyQXAV74ocScbjJJh');
exports.PNG_TOKEN_SWAP_FEE_ACCOUNT_OWNER = new web3_js_1.PublicKey('3M1gJoNCxuw6GBMRatHzCvxwbQMiUZ6VoG22UCjubQZq');
exports.SOL_TOKEN_MINT = new web3_js_1.PublicKey('So11111111111111111111111111111111111111112');
exports.SYSTEM_PROGRAM_ID = new web3_js_1.PublicKey('11111111111111111111111111111111');
exports.PNG_TOKEN_SWAP_FEE_STRUCTURE = {
    tradeFeeNumerator: 25,
    tradeFeeDenominator: 10000,
    ownerTradeFeeNumerator: 5,
    ownerTradeFeeDenominator: 10000,
    ownerWithdrawFeeNumerator: 0,
    ownerWithdrawFeeDenominator: 0
};
var CurveType;
(function (CurveType) {
    CurveType[CurveType["ConstantProduct"] = 0] = "ConstantProduct";
    CurveType[CurveType["ConstantPrice"] = 1] = "ConstantPrice";
    CurveType[CurveType["Stable"] = 2] = "Stable";
    CurveType[CurveType["Offset"] = 3] = "Offset";
})(CurveType = exports.CurveType || (exports.CurveType = {}));
