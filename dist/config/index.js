"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stakings = exports.bondings = exports.pools = exports.tokens = void 0;
const pools_1 = require("./pools");
const bondings_1 = require("./bondings");
const stakings_1 = require("./stakings");
const tokens_devnet_1 = require("./tokens.devnet");
const tokens_mainnet_1 = require("./tokens.mainnet");
exports.tokens = {
    'devnet': tokens_devnet_1.tokens,
    'mainnet-beta': tokens_mainnet_1.tokens,
    'testnet': tokens_devnet_1.tokens
};
exports.pools = {
    'devnet': pools_1.devnetPools,
    'mainnet-beta': pools_1.mainnetPools,
    'testnet': pools_1.devnetPools
};
exports.bondings = {
    'devnet': bondings_1.devnetBondings,
    'mainnet-beta': bondings_1.mainnetBondings,
    'testnet': bondings_1.devnetBondings
};
exports.stakings = {
    'devnet': stakings_1.devnetStakings,
    'mainnet-beta': stakings_1.mainnetStakings,
    'testnet': stakings_1.devnetStakings
};
