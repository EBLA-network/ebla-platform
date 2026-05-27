import React, { useContext, createContext } from 'react';

// Stub - returns empty stats for all validators.
//
// The original implementation fetched per-validator PBFT block production
// stats from the indexer at networks[chainId].indexerUrl/validators?limit=N.
// That indexer host doesn't exist (VM 611 deferred), so every fetch
// returned ERR_NAME_NOT_RESOLVED and the while loop retried forever,
// flooding the console with 30+ errors per page load.
//
// Until VM 611 lands, pbftsProduced shows 0 for every validator.
// Restore the original logic when VM 611 has the indexer running.

export type ValidatorStats = { address: string; pbftCount: number; rank: number };

type Context = {
  validatorWeekStats: ValidatorStats[];
  getPbftBlocksProduced: (address: string) => number;
};

const initialState: Context = {
  validatorWeekStats: [],
  getPbftBlocksProduced: () => 0,
};

const ValidatorWeeklyStatsContext = createContext<Context>(initialState);

export const ValidatorWeeklyStatsProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <ValidatorWeeklyStatsContext.Provider value={initialState}>
      {children}
    </ValidatorWeeklyStatsContext.Provider>
  );
};

export const useValidatorsWeeklyStats = () => {
  return useContext(ValidatorWeeklyStatsContext);
};
