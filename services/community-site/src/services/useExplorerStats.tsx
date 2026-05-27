import { useCallback, useMemo } from 'react';
import { Validator } from '../interfaces/Validator';

// Stub - passes through validators unchanged.
//
// The original implementation enriched validators with indexer data
// (rank, isActive, status, pbfts produced, yield) by calling the
// indexer at networks[chainId].indexerUrl. That indexer service is
// deferred to VM 611. When VM 611 lands, restore the original logic
// (see git history pre-commit 5).
//
// Until then, validators show with default placeholder values:
//   isActive: false
//   status: NOT_ELIGIBLE
//   rank: 0
//   pbftsProduced: 0
//   yield: 0
// This is acceptable for testnet display.

export default () => {
  const passthrough = useCallback(async (validators: Validator[]) => {
    return validators;
  }, []);

  return useMemo(
    () => ({
      updateValidatorsStats: passthrough,
      updateValidatorsRank: passthrough,
      updateTestnetValidatorsStats: passthrough,
      updateTestnetValidatorsRank: passthrough,
    }),
    [passthrough],
  );
};
