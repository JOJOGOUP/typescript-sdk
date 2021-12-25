import type { Provider } from '@saberhq/solana-contrib';

import {
  BondingConfig,
  BondingInfo,
  StakeConfigInfo,
  VestConfigInfo
} from '../../types';

import {
  PNG_BONDING_ID,
  PNG_VESTING_ID,
  DecimalUtil,
  ZERO_DECIMAL,
  deriveAssociatedTokenAddress,
  resolveOrCreateAssociatedTokenAddress,
  ZERO_U64,
  getTokenAccountInfo,
  getTokenMintInfo,
  PNG_STAKING_ID
} from '../../utils';

import {
  PublicKey,
  SYSVAR_RENT_PUBKEY,
  SYSVAR_CLOCK_PUBKEY,
  SystemProgram
} from '@solana/web3.js';

import {
  u64,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID
} from '@solana/spl-token';

import idl from './idl.json';
import vestingIdl from './idl_vesting.json';
import stakingIdl from './staking.json';

import { Idl, Program } from '@project-serum/anchor';
import { TransactionEnvelope } from '@saberhq/solana-contrib';

const BONDING_SEED_PREFIX = 'bonding_authority';

const VESTING_SEED_PREFIX = 'vesting';
const VESTING_SIGNER_SEED_PREFIX = 'vesting_signer';
const VESTING_CONFIG_SIGNER_SEED_PREFIX = 'vest_config_signer';

const STAKING_SEED_PREFIX = 'staking_authority';

export class Bonding {
  public config: BondingConfig;
  private program: Program;
  private vestingProgram: Program;
  private stakingProgram: Program;

  constructor(provider: Provider, config: BondingConfig) {
    this.config = config;
    this.program = new Program(idl as Idl, PNG_BONDING_ID, provider as any);
    this.vestingProgram = new Program(vestingIdl as Idl, PNG_VESTING_ID, provider as any);
    this.stakingProgram = new Program(stakingIdl as Idl, PNG_STAKING_ID, provider as any);
  }


  async getStakeConfigInfo(): Promise<StakeConfigInfo> {
    const {
      tokenMint,
      stakeTokenMint,
      tokenHolder,
      rebaseEpochDuration,
      rebaseLastTime,
      rebaseRateNumerator,
      rebaseRateDenominator,
      rewardsHolder,
      rebaseSupply
    } = await this.stakingProgram.account.staking.fetch(this.config.staking);


    return {
      tokenMint,
      sTokenMint: stakeTokenMint,
      tokenHolder,
      rebaseEpochDuration: rebaseEpochDuration.toNumber(),
      rebaseLastTime: rebaseLastTime.toNumber(),
      rebaseRateNumerator: rebaseRateNumerator.toNumber(),
      rebaseRateDenominator: rebaseRateDenominator.toNumber(),
      rewardsHolder,
      rebaseSupply
    }
  }

  async stake(): Promise<TransactionEnvelope> {
    const stakeConfigInfo = await this.getStakeConfigInfo();

    const [authority] = await PublicKey.findProgramAddress(
      [Buffer.from(STAKING_SEED_PREFIX), this.config.staking.toBuffer()],
      this.stakingProgram.programId
    );

    const owner = this.stakingProgram.provider.wallet?.publicKey;

    const stakedHolder = await deriveAssociatedTokenAddress(authority, stakeConfigInfo.tokenMint);
    const userTokenHolder = await deriveAssociatedTokenAddress(owner, stakeConfigInfo.tokenMint);
    const { address: userSTokenHolder, ...resolveUserSTokenAccountInstrucitons } =
      await resolveOrCreateAssociatedTokenAddress(
        this.stakingProgram.provider.connection,
        owner,
        stakeConfigInfo.sTokenMint
      );

    const stakeInstruction = this.stakingProgram.instruction.stakeAll({
      accounts: {
        staking: this.config.staking,
        stakingPda: authority,
        stakeTokenMint: stakeConfigInfo.sTokenMint,
        tokenHolder: stakedHolder,
        userTokenHolder,
        userStakeTokenHolder: userSTokenHolder,
        owner,
        tokenProgram: TOKEN_PROGRAM_ID,
      },
    });

    return new TransactionEnvelope(
      this.stakingProgram.provider as any,
      [
        ...resolveUserSTokenAccountInstrucitons.instructions,
        stakeInstruction
      ],
      [
        ...resolveUserSTokenAccountInstrucitons.signers
      ]
    );
  }

  async unstake(amount: u64): Promise<TransactionEnvelope> {
    const stakeConfigInfo = await this.getStakeConfigInfo();

    const [authority] = await PublicKey.findProgramAddress(
      [Buffer.from(STAKING_SEED_PREFIX), this.config.staking.toBuffer()],
      this.stakingProgram.programId
    );

    const owner = this.stakingProgram.provider.wallet?.publicKey;

    const stakedHolder = await deriveAssociatedTokenAddress(authority, stakeConfigInfo.tokenMint);
    const userTokenHolder = await deriveAssociatedTokenAddress(owner, stakeConfigInfo.tokenMint);
    const userSTokenHolder = await deriveAssociatedTokenAddress(owner, stakeConfigInfo.sTokenMint);

    const unstakeInstruction = this.stakingProgram.instruction.unstake(amount, {
      accounts: {
        staking: this.config.staking,
        stakingPda: authority,
        stakeTokenMint: stakeConfigInfo.sTokenMint,
        tokenHolder: stakedHolder,
        userTokenHolder,
        userStakeTokenHolder: userSTokenHolder,
        owner,
        tokenProgram: TOKEN_PROGRAM_ID,
      },
    });

    return new TransactionEnvelope(
      this.stakingProgram.provider as any,
      [
        unstakeInstruction
      ],
      []
    );
  }


  async getVestConfigInfo(): Promise<VestConfigInfo | null> {
    try {

      const {
        vestMint,
        claimAllDuration,
        halfLifeDuration,
        claimableHolder,
        claimableMint
      } = await this.vestingProgram.account.vestConfig.fetch(this.config.vestConfig);

      return {
        vestMint,
        claimAllDuration: claimAllDuration.toNumber(),
        halfLifeDuration: halfLifeDuration.toNumber(),
        claimableHolder,
        claimableMint
      }
    } catch (err) {
      return null;
    }
  }

  async getUserVesting(user: PublicKey) {
    const [userVestingAddr] = await PublicKey.findProgramAddress(
      [Buffer.from(VESTING_SEED_PREFIX), this.config.vestConfig.toBuffer(), user.toBuffer()],
      this.vestingProgram.programId
    );

    try {
      const vesting = await this.vestingProgram.account.vesting.fetch(userVestingAddr);

      return vesting;
    } catch (err) {
      return null;
    }
  }

  async getBondingInfo(): Promise<BondingInfo> {
    const {
      bondingSupply,
      lastDecay,
      decayFactor,
      controlVariable,
      totalDebt,
      maxDebt,
      maxPayout,
      minPrice,

      payoutHolder,
      payoutTokenMint,
      depositHolder,
      depositTokenMint,

    } = await this.program.account.bonding.fetch(this.config.addr);

    // console.log(await this.program.account.bonding.fetch(this.config.addr))

    const [depositHolderInfo] = await Promise.all([
      getTokenAccountInfo(this.program.provider as any, depositHolder)
    ]);

    return {
      address: this.config.addr,
      bondingSupply,
      lastDecay: lastDecay.toNumber(),
      decayFactor: decayFactor.toNumber(),
      controlVariable: controlVariable.toNumber(),
      totalDebt,
      maxDebt,
      maxPayout,
      minPrice,

      payoutHolder,
      payoutTokenMint,
      depositHolder,
      depositTokenMint,
      depositHolderAmount: depositHolderInfo ? DecimalUtil.fromU64(depositHolderInfo.amount) : ZERO_DECIMAL,
    }
  }

  private decay(bondingInfo: BondingInfo): u64 {
    const { lastDecay, totalDebt, decayFactor } = bondingInfo;

    const duration = Math.floor(new Date().getTime() / 1000 - lastDecay);
    const decay = totalDebt.mul(new u64(duration)).div(new u64(decayFactor));

    return decay.gt(totalDebt) ? totalDebt : decay;
  }

  /* private async valuation(bondingInfo: BondingInfo, amount: u64): Promise<u64> {
    const { payoutTokenMint, depositTokenMint } = bondingInfo;

    const [payoutTokenMintInfo, depositTokenMintInfo = await Promise.all([
      getTokenMintInfo(this.program.provider as any, payoutTokenMint),
      getTokenMintInfo(this.program.provider as any, depositTokenMint),
    ]);

    if (!lpInfo) {
      return amount.mul(new u64(Math.pow(10, payoutTokenMintInfo.decimals)))
        .div(new u64(Math.pow(10, depositTokenMintInfo.decimals)));
    } else {
      const { tokenADecimals, tokenBDecimals } = lpInfo;

      const decimals = tokenADecimals + tokenBDecimals - 2 * depositTokenMintInfo.decimals;
      const tokenAAmount = tokenAHolderInfo?.amount || ZERO_U64;
      const tokenBAmount = tokenBHolderInfo?.amount || ZERO_U64;

      const kValue = tokenAAmount.mul(tokenBAmount).div(new u64(Math.pow(10, decimals)));

      const totalValue = DecimalUtil.fromU64(kValue).sqrt().mul(2);

      return DecimalUtil.toU64(totalValue, depositTokenMintInfo.decimals)
        .mul(amount)
        .div(new u64(Math.pow(10, depositTokenMintInfo.decimals)))
        .div(depositTokenMintInfo.supply);
    }

  } */

 /*  async calcPayout(amount: u64): Promise<u64> {
    const bondingInfo = await this.getBondingInfo();
    const { totalDebt, bondingSupply, controlVariable } = bondingInfo;

    console.log('program totalDebt=======', DecimalUtil.beautify(DecimalUtil.fromU64(totalDebt, 6)));
    // totalDebt * 10EpayoutDecimals / totalSupply
    const debtRatio =
      totalDebt
        .sub(this.decay(bondingInfo))
        .mul(new u64(1e9)) //
        .div(bondingSupply);

    //  每个bonding的价格
    // debtRatio * controlVariable / 10E(payoutTokenDecimals - 5)
    const price =
      debtRatio
        .mul(new u64(controlVariable))
        .add(new u64(1e9))
        .div(new u64(1e7))
        .toNumber();

    const valuation = await this.valuation(bondingInfo, amount);

    return valuation.mul(new u64(100)).div(new u64(price));
  } */

  async purchaseToken(amount: u64): Promise<TransactionEnvelope> {

    const owner = this.program.provider.wallet?.publicKey;

    const bondingInfo = await this.getBondingInfo();

    const [bondingPda] = await PublicKey.findProgramAddress(
      [Buffer.from(BONDING_SEED_PREFIX), this.config.addr.toBuffer()],
      this.program.programId
    );

    const userDepositHolder = await deriveAssociatedTokenAddress(owner, bondingInfo.depositTokenMint);

    const { address: userPayoutHolder, ...resolveUPHAccountInstrucitons } =
      await resolveOrCreateAssociatedTokenAddress(
        this.program.provider.connection,
        owner,
        bondingInfo.payoutTokenMint,
      );


    const purchaseInstruction = this.program.instruction.bond(
      amount,
      new u64(1e10),
      {
        accounts: {
          bonding: this.config.addr,
          bondingPda: bondingPda,

          depositTokenMint: bondingInfo.depositTokenMint,
          depositHolder: bondingInfo.depositHolder,
          payoutTokenMint: bondingInfo.payoutTokenMint,
          payoutHolder: bondingInfo.payoutHolder,

          userDepositHolder: userDepositHolder,
          userPayoutHolder: userPayoutHolder,
          owner,
          tokenProgram: TOKEN_PROGRAM_ID,
        }
      }
    );

    return new TransactionEnvelope(
      this.program.provider as any,
      [
        ...resolveUPHAccountInstrucitons.instructions,
        purchaseInstruction
      ],
      [
        ...resolveUPHAccountInstrucitons.signers
      ]
    );
  }

  async vestStake(amount: u64): Promise<TransactionEnvelope> {

    const owner = this.vestingProgram.provider.wallet?.publicKey;
    const vestConfig = await this.vestingProgram.account.vestConfig.fetch(this.config.vestConfig);


    const [vestingPda, nonce] = await PublicKey.findProgramAddress(
      [Buffer.from(VESTING_CONFIG_SIGNER_SEED_PREFIX), this.config.vestConfig.toBuffer()],
      this.vestingProgram.programId
    );

    const userClaimableHolder = await deriveAssociatedTokenAddress(owner, vestConfig.claimableMint);
    const { address: userVestHolder, ...resolveUserVHolderAccountInstrucitons } =
      await resolveOrCreateAssociatedTokenAddress(
        this.vestingProgram.provider.connection,
        owner,
        vestConfig.vestMint
      );

    const stakeInstruction = this.vestingProgram.instruction.stake(
      new u64(amount),
      {
        accounts: {
          vestConfig: this.config.vestConfig,
          vestConfigSigner: vestingPda,
          vestMint: vestConfig.vestMint,

          claimableHolder: vestConfig.claimableHolder,
          userClaimableHolder: userClaimableHolder,
          userVestHolder: userVestHolder,

          owner,
          tokenProgram: TOKEN_PROGRAM_ID
        }
      }

    )
    return new TransactionEnvelope(
      this.vestingProgram.provider as any,
      [
        ...resolveUserVHolderAccountInstrucitons.instructions,
        stakeInstruction
      ],
      [
        ...resolveUserVHolderAccountInstrucitons.signers
      ]
    );

  }


  async vestVToken(): Promise<TransactionEnvelope> {

    const bondingInfo = await this.getBondingInfo();

    const owner = this.program.provider.wallet?.publicKey;
    const vestingInstructions = [];

    const [vestingAddr] = await PublicKey.findProgramAddress(
      [Buffer.from(VESTING_SEED_PREFIX), this.config.vestConfig.toBuffer(), owner.toBuffer()],
      this.vestingProgram.programId
    );

    const vestingAccountInfo = await this.program.provider.connection.getAccountInfo(vestingAddr);

    const [vSigner, nonce] = await PublicKey.findProgramAddress(
      [Buffer.from(VESTING_SIGNER_SEED_PREFIX), vestingAddr.toBuffer()],
      this.vestingProgram.programId
    );

    const vestedHolder = await deriveAssociatedTokenAddress(vSigner, bondingInfo.payoutTokenMint);
    const userVestHolder = await deriveAssociatedTokenAddress(owner, bondingInfo.payoutTokenMint);

    if (!vestingAccountInfo) {
      vestingInstructions.push(this.vestingProgram.instruction.initVesting(nonce, {
        accounts: {
          vestConfig: this.config.vestConfig,
          vesting: vestingAddr,
          vestMint: bondingInfo.payoutTokenMint,
          vestedHolder,
          vestingSigner: vSigner,

          payer: owner,
          rent: SYSVAR_RENT_PUBKEY,
          clock: SYSVAR_CLOCK_PUBKEY,
          systemProgram: SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        }
      }));
    }

    vestingInstructions.push(this.vestingProgram.instruction.update({
      accounts: {
        vestConfig: this.config.vestConfig,
        vesting: vestingAddr,
        vestedHolder,
        vestMint: bondingInfo.payoutTokenMint,
        vestingSigner: vSigner,
        owner,
        clock: SYSVAR_CLOCK_PUBKEY,
        tokenProgram: TOKEN_PROGRAM_ID,
      }
    }));

    vestingInstructions.push(this.vestingProgram.instruction.vestAll(
      {
        accounts: {
          vesting: vestingAddr,
          vestedHolder,
          userVestHolder,
          owner,
          clock: SYSVAR_CLOCK_PUBKEY,
          tokenProgram: TOKEN_PROGRAM_ID,
        }
      }
    ));

    return new TransactionEnvelope(
      this.program.provider as any,
      [
        ...vestingInstructions
      ],
      []
    );

  }

  async claimVestedToken(tokenMint: PublicKey): Promise<TransactionEnvelope> {
    const bondingInfo = await this.getBondingInfo();

    const owner = this.program.provider.wallet?.publicKey;

    const [vestingAddr] = await PublicKey.findProgramAddress(
      [Buffer.from(VESTING_SEED_PREFIX), this.config.vestConfig.toBuffer(), owner.toBuffer()],
      this.vestingProgram.programId
    );

    const [vSigner] = await PublicKey.findProgramAddress(
      [Buffer.from(VESTING_SIGNER_SEED_PREFIX), vestingAddr.toBuffer()],
      this.vestingProgram.programId
    );

    const [vcSigner] = await PublicKey.findProgramAddress(
      [Buffer.from(VESTING_CONFIG_SIGNER_SEED_PREFIX), this.config.vestConfig.toBuffer()],
      this.vestingProgram.programId
    );

    const vestedHolder = await deriveAssociatedTokenAddress(vSigner, bondingInfo.payoutTokenMint);

    const claimableHolder = await deriveAssociatedTokenAddress(
      vcSigner,
      tokenMint
    );

    const { address: userTokenHolder, ...resolveUserTokenAccountInstrucitons } =
      await resolveOrCreateAssociatedTokenAddress(
        this.program.provider.connection,
        owner,
        tokenMint
      );

    const updateInstruction = this.vestingProgram.instruction.update({
      accounts: {
        vestConfig: this.config.vestConfig,
        vesting: vestingAddr,
        vestedHolder,
        vestMint: bondingInfo.payoutTokenMint,
        vestingSigner: vSigner,
        owner,
        clock: SYSVAR_CLOCK_PUBKEY,
        tokenProgram: TOKEN_PROGRAM_ID,
      }
    });

    const claimInstruction = this.vestingProgram.instruction.claim({
      accounts: {
        vestConfig: this.config.vestConfig,
        vestConfigSigner: vcSigner,
        claimableHolder,
        vesting: vestingAddr,
        userClaimableHolder: userTokenHolder,
        owner,
        clock: SYSVAR_CLOCK_PUBKEY,
        tokenProgram: TOKEN_PROGRAM_ID,
      },
      instructions: [updateInstruction],
    });

    return new TransactionEnvelope(
      this.program.provider as any,
      [
        updateInstruction,

        ...resolveUserTokenAccountInstrucitons.instructions,
        claimInstruction
      ],
      [
        ...resolveUserTokenAccountInstrucitons.signers
      ]
    )
  }

  static estimatedVestingClaimable(
    halfLifeDuration: number,
    claimAllDuration: number,
    vestedHolderAmount: u64,
    lastUpdatedTime: number,
    lastVestTime: number,
    claimableAmount: u64,
    updateTime: number //in seconds
  ): u64 {

    // if (updateTime <= lastUpdatedTime) {
    //   throw Error('update time should gt lastUpdateTime');
    // }

    //no more vested amount
    if (vestedHolderAmount.lte(ZERO_U64)) {
      return claimableAmount;
    }

    // claimed all
    if (updateTime - lastVestTime > claimAllDuration) {
      return claimableAmount.add(vestedHolderAmount);
    }

    const timeElapsed = updateTime - lastUpdatedTime;

    const newRemainedAmount =
      DecimalUtil.fromU64(vestedHolderAmount)
        .mul(
          DecimalUtil.fromNumber(Math.exp((-Math.LN2 * timeElapsed) / halfLifeDuration))
        );

    const newClaimableAmount = DecimalUtil.fromU64(vestedHolderAmount).sub(newRemainedAmount);

    return claimableAmount.add(DecimalUtil.toU64(newClaimableAmount));
  }

}