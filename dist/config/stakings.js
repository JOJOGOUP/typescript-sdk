"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.devnetStakings = exports.mainnetStakings = void 0;
const web3_js_1 = require("@solana/web3.js");
exports.mainnetStakings = [];
exports.devnetStakings = [
    {
        address: new web3_js_1.PublicKey('EFes66miKQkoSHsYwFBiKTaSKvX9Cd8CQgCSqLrZf38'),
        vestConfig: new web3_js_1.PublicKey('HbrVWaVLb98ozeSiC69tt9T7TXYB8j2qyCke6qqEMC97'),
        payoutAsset: new web3_js_1.PublicKey('PNGXZxRnRwixr7jrMSctAErSTF5SRnPQcuakkWRHe4h')
    }
];
