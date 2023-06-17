"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultRpcUrls = exports.supportedNetworks = void 0;
exports.supportedNetworks = new Set(['mainnet', 'sepolia', 'optimism-goerli']);
exports.defaultRpcUrls = {
    'mainnet': 'https://rpc.eth.gateway.fm',
    'goerli': 'https://goerli.gateway.tenderly.co',
    'sepolia': 'https://sepolia.gateway.tenderly.co',
    'optimism-goerli': 'https://goerli.optimism.io',
    'optimism': 'https://mainnet.optimism.io'
};
