import { PublicKey } from '@solana/web3.js';

import { BondingConfig } from '../types';

export const mainnetBondings: BondingConfig[] = [
];

export const devnetBondings: BondingConfig[] = [
  {
    addr: new PublicKey('4EUnDTfN16D6dmK4oPvRPpWjM92NSVfCABvKGDQLgyX3'),
    vestConfig: new PublicKey('4BTVzF6jEnT1G5cpSp7s9P6eoNQnZe3RZTrtoxU7PJuZ')
  }

];