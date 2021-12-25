import { PublicKey } from '@solana/web3.js';

import { BondingConfig } from '../types';

export const mainnetBondings: BondingConfig[] = [
];

export const devnetBondings: BondingConfig[] = [
  // {
  //   addr: new PublicKey('4EUnDTfN16D6dmK4oPvRPpWjM92NSVfCABvKGDQLgyX3'),
  //   vestConfig: new PublicKey('4BTVzF6jEnT1G5cpSp7s9P6eoNQnZe3RZTrtoxU7PJuZ')
  // }
  {
    addr: new PublicKey('EzgR77v5BPZ3U1bFUFPSvmMBadvH9iZDitMAvtJKBgxY'),
    vestConfig: new PublicKey('B4nJVtNgqZAjWMy5Twy1JbXYgsX5K4LjKvUaZT6SrvCm'),
    staking: new PublicKey('3sHcGhf9YN9DTRvHM33s7T4ZvqtSTAn1mLASHyg4mufs')
  }

];

export const devnetStakings: BondingConfig[] = [
  // {
  //   addr: new PublicKey('4EUnDTfN16D6dmK4oPvRPpWjM92NSVfCABvKGDQLgyX3'),
  //   vestConfig: new PublicKey('4BTVzF6jEnT1G5cpSp7s9P6eoNQnZe3RZTrtoxU7PJuZ')
  // }
  {
    addr: new PublicKey('EzgR77v5BPZ3U1bFUFPSvmMBadvH9iZDitMAvtJKBgxY'),
    vestConfig: new PublicKey('B4nJVtNgqZAjWMy5Twy1JbXYgsX5K4LjKvUaZT6SrvCm'),
    staking: new PublicKey('3sHcGhf9YN9DTRvHM33s7T4ZvqtSTAn1mLASHyg4mufs')
  }

];