import { PublicKey } from '@solana/web3.js';
import { BondingConfig } from '../types';

export const mainnetBondings: BondingConfig[] = [
];

export const devnetBondings: BondingConfig[] = [
  {
    address: new PublicKey('4ZUoQziFMLyfstmebiQHvaUyU1Dw7KWfd8JfKXmb7AnU'),
    staking: new PublicKey('3sHcGhf9YN9DTRvHM33s7T4ZvqtSTAn1mLASHyg4mufs'),
    payoutAsset: new PublicKey('PNGmGQ7SwKTHHPCRgnznYbyTPkrAxcAPLqpgNDYNP1g')
  }
];