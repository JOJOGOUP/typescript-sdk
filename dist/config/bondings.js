"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.devnetBondings = exports.mainnetBondings = void 0;
const web3_js_1 = require("@solana/web3.js");
exports.mainnetBondings = [];
exports.devnetBondings = [
    {
        address: new web3_js_1.PublicKey('8bT37j6LSRrmkQShndDFG3E9TURkJfWVJafHrRPgmMgZ'),
        staking: new web3_js_1.PublicKey('3sHcGhf9YN9DTRvHM33s7T4ZvqtSTAn1mLASHyg4mufs'),
        payoutAsset: new web3_js_1.PublicKey('PNGmGQ7SwKTHHPCRgnznYbyTPkrAxcAPLqpgNDYNP1g')
    }
];
