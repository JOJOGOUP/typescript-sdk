"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.devnetStakings = exports.mainnetStakings = void 0;
const web3_js_1 = require("@solana/web3.js");
exports.mainnetStakings = [];
exports.devnetStakings = [
    {
        address: new web3_js_1.PublicKey('3sHcGhf9YN9DTRvHM33s7T4ZvqtSTAn1mLASHyg4mufs'),
        vestConfig: new web3_js_1.PublicKey('B4nJVtNgqZAjWMy5Twy1JbXYgsX5K4LjKvUaZT6SrvCm'),
        payoutAsset: new web3_js_1.PublicKey('PNGmGQ7SwKTHHPCRgnznYbyTPkrAxcAPLqpgNDYNP1g')
    }
];
