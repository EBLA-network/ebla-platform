import { useCallback, useMemo } from 'react';
import { BigNumber } from 'ethers';
import axios from 'axios';
import { Validator, ValidatorStatus } from '../interfaces/Validator';
import { networks } from '../utils/networks';
import useMainnet from './useMainnet';

// Derives each validator's status from on-chain stake + indexer block production:
//   NOT_ELIGIBLE      total stake < 5,000 EBLA                 (chain only)
//   ELIGIBLE          stake >= 5,000 EBLA and pbftCount > 0    (chain + indexer)
//   ELIGIBLE_INACTIVE stake >= 5,000 EBLA and pbftCount === 0  (chain + indexer)
//
// pbftCount comes from the indexer's weekly /validators list (one paginated
// call for ALL validators, not one call per validator). If the indexer is
// unreachable (down / DNS / CORS) the validators pass through unchanged, so the
// table still renders with on-chain data and the default grey status.

// Minimum total stake for consensus eligibility: 5,000 EBLA in wei
// (EBLA Core Spec `eligibility_balance_threshold`).
const ELIGIBILITY_THRESHOLD = BigNumber.from(5_000).mul(BigNumber.from(10).pow(18));

// Indexer pagination page size + a safety cap so a bad `hasNext` can't loop forever.
const PAGE_LIMIT = 100;
const MAX_PAGES = 100;

type IndexerValidator = {
  address: string;
  pbftCount: number;
  rank: number;
  yield?: string;
};

export default () => {
  const { chainId } = useMainnet();

  // Fetch the current-week validator stats from the indexer as a
  // lowercased-address -> stats map. Returns null if the indexer is unreachable.
  const fetchWeekStats = useCallback(async (): Promise<Map<string, IndexerValidator> | null> => {
    const indexerUrl = networks[chainId]?.indexerUrl;
    if (!indexerUrl) {
      return null;
    }

    const stats = new Map<string, IndexerValidator>();
    try {
      let start = 0;
      let pages = 0;
      let hasNext = true;
      while (hasNext && pages < MAX_PAGES) {
        // eslint-disable-next-line no-await-in-loop
        const { data } = await axios.get(`${indexerUrl}/validators`, {
          params: { start, limit: PAGE_LIMIT },
        });
        const rows: IndexerValidator[] = data?.data ?? [];
        rows.forEach((row) => stats.set(row.address.toLowerCase(), row));
        hasNext = Boolean(data?.hasNext);
        start += PAGE_LIMIT;
        pages += 1;
      }
    } catch (e) {
      // Indexer unreachable: degrade gracefully rather than blocking the table.
      // eslint-disable-next-line no-console
      console.error('useExplorerStats: indexer /validators fetch failed:', e);
      return null;
    }
    return stats;
  }, [chainId]);

  const updateValidatorsStats = useCallback(
    async (validators: Validator[]): Promise<Validator[]> => {
      if (validators.length === 0) {
        return validators;
      }

      const stats = await fetchWeekStats();
      if (!stats) {
        return validators;
      }

      return validators.map((validator) => {
        const row = stats.get(validator.address.toLowerCase());
        const pbftCount = row?.pbftCount ?? 0;
        const isEligible = validator.delegation.gte(ELIGIBILITY_THRESHOLD);

        let status = ValidatorStatus.NOT_ELIGIBLE;
        if (isEligible) {
          status = pbftCount > 0 ? ValidatorStatus.ELIGIBLE : ValidatorStatus.ELIGIBLE_INACTIVE;
        }

        return {
          ...validator,
          status,
          isActive: status === ValidatorStatus.ELIGIBLE,
          pbftsProduced: pbftCount,
          rank: row?.rank ?? validator.rank,
        };
      });
    },
    [fetchWeekStats],
  );

  // Rank is folded into updateValidatorsStats; keep this a passthrough so the
  // existing rank-then-stats call sequence still works.
  const passthrough = useCallback(async (validators: Validator[]) => validators, []);

  return useMemo(
    () => ({
      updateValidatorsStats,
      updateValidatorsRank: passthrough,
      updateTestnetValidatorsStats: updateValidatorsStats,
      updateTestnetValidatorsRank: passthrough,
    }),
    [updateValidatorsStats, passthrough],
  );
};
