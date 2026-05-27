import { useCallback, useMemo } from 'react';
import { BigNumber } from 'ethers';
import useDpos from './useDpos';
import { Validator, ValidatorStatus, ValidatorType } from '../interfaces/Validator';
import { useLoading } from './useLoading';

// Maximum delegation per validator: 80M EBLA in wei.
// Used to compute availableForDelegation and isFullyDelegated.
const MAX_DELEGATION = BigNumber.from(80_000_000).mul(BigNumber.from(10).pow(18));

// Safety cap on batch pagination - real validator counts are << 100 batches.
const MAX_BATCHES = 100;

// Maps a chain-returned ValidatorData ({ account, info }) onto the
// Validator interface the rest of the app expects.
// Fields populated from indexer (rank, yield, pbftsProduced, isActive, status)
// are left as defaults; useExplorerStats fills them once VM 611 lands.
const chainValidatorToValidator = (chainValidator: {
  account: string;
  info: {
    total_stake: BigNumber;
    commission_reward: BigNumber;
    commission: number;
    last_commission_change: BigNumber;
    undelegations_count: number;
    owner: string;
    description: string;
    endpoint: string;
  };
}): Validator => {
  const { account, info } = chainValidator;
  const delegation = BigNumber.from(info.total_stake);

  return {
    address: account.toLowerCase(),
    owner: info.owner.toLowerCase(),
    commission: info.commission,
    commissionReward: BigNumber.from(info.commission_reward),
    lastCommissionChange: BigNumber.from(info.last_commission_change).toNumber(),
    delegation,
    availableForDelegation: MAX_DELEGATION.sub(delegation),
    isFullyDelegated: delegation.gte(MAX_DELEGATION),
    isActive: false,
    status: ValidatorStatus.NOT_ELIGIBLE,
    description: info.description || '',
    endpoint: info.endpoint || '',
    rank: 0,
    pbftsProduced: 0,
    yield: 0,
    type: ValidatorType.MAINNET,
    registrationBlock: 0,
  };
};

export default () => {
  const { mainnetDpos } = useDpos();
  const { startLoading, finishLoading } = useLoading();

  const getValidators = useCallback(async (): Promise<Validator[]> => {
    if (!mainnetDpos) {
      return [];
    }
    startLoading!();
    try {
      const collected: any[] = [];
      let batch = 0;
      while (batch < MAX_BATCHES) {
        const result = await mainnetDpos.getValidators(batch);
        collected.push(...result.validators);
        if (result.end) {
          break;
        }
        batch++;
      }
      return collected.map(chainValidatorToValidator);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('getValidators failed:', e);
      return [];
    } finally {
      finishLoading!();
    }
  }, [mainnetDpos]);

  const getValidator = useCallback(
    async (address: string): Promise<Validator> => {
      if (!mainnetDpos) {
        throw new Error('mainnetDpos not ready');
      }
      startLoading!();
      try {
        const info = await mainnetDpos.getValidator(address);
        // getValidator returns just ValidatorBasicInfo (no wrapper); synthesize the ValidatorData shape.
        return chainValidatorToValidator({ account: address, info });
      } finally {
        finishLoading!();
      }
    },
    [mainnetDpos],
  );

  const getValidatorsWith = useCallback(
    async (addresses: string[]): Promise<Validator[]> => {
      if (addresses.length === 0 || !mainnetDpos) {
        return [];
      }
      startLoading!();
      try {
        const results = await Promise.all(
          addresses.map(async (address) => {
            const info = await mainnetDpos.getValidator(address);
            return chainValidatorToValidator({ account: address, info });
          }),
        );
        return results;
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('getValidatorsWith failed:', e);
        return [];
      } finally {
        finishLoading!();
      }
    },
    [mainnetDpos],
  );

  const getValidatorsFor = useCallback(
    async (address: string): Promise<Validator[]> => {
      if (!mainnetDpos) {
        return [];
      }
      startLoading!();
      try {
        const collected: any[] = [];
        let batch = 0;
        while (batch < MAX_BATCHES) {
          const result = await mainnetDpos.getValidatorsFor(address, batch);
          collected.push(...result.validators);
          if (result.end) {
            break;
          }
          batch++;
        }
        return collected.map(chainValidatorToValidator);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('getValidatorsFor failed:', e);
        return [];
      } finally {
        finishLoading!();
      }
    },
    [mainnetDpos],
  );

  return useMemo(
    () => ({
      getValidators,
      getValidatorsWith,
      getValidatorsFor,
      getValidator,
    }),
    [getValidators, getValidatorsWith, getValidatorsFor, getValidator],
  );
};
