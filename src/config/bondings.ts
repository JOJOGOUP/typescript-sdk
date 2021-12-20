import { PublicKey } from '@solana/web3.js';

import { BondingConfig } from '../types';

export const mainnetBondings: BondingConfig[] = [
];

export const devnetBondings: BondingConfig[] = [
  {
    addr: new PublicKey('7TSG79QSWvhAc8NZAcvMZTgk1eWYDKeTsyXNRrKDxrH5'),
    vestConfig: new PublicKey('8GZxgKPfqa5TtHghff6fjAKSCXeWcYAUu4qiU75rCDhf')
  }

];