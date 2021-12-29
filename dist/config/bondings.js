"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.devnetBondings = exports.mainnetBondings = void 0;
const web3_js_1 = require("@solana/web3.js");
exports.mainnetBondings = [];
exports.devnetBondings = [
    {
        address: new web3_js_1.PublicKey('dCN5mwZbDeWCHfp9NF7tv9VVHPmjPSKLpUnKc4WC8bJ'),
        staking: new web3_js_1.PublicKey('EFes66miKQkoSHsYwFBiKTaSKvX9Cd8CQgCSqLrZf38'),
        payoutAsset: new web3_js_1.PublicKey('PNGXZxRnRwixr7jrMSctAErSTF5SRnPQcuakkWRHe4h')
    }
];
