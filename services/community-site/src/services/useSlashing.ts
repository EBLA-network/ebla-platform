import { useCallback, useMemo } from 'react';
import { BigNumber } from 'ethers';
import useDpos from './useDpos';
import { Validator, NodeState } from '../interfaces/Validator';

// Each 1,000 EBLA of stake grants one eligible consensus vote, so a healthy
// eligible validator has eligibleVotes === floor(stake / 1,000 EBLA). The
// inactivity penalty decays a validator's voting-power factor, dropping its
// eligibleVotes below that expected count — that is what isSlashed detects.
const VOTE_STEP = BigNumber.from(1_000).mul(BigNumber.from(10).pow(18));

// Derives the authoritative on-chain state for each node directly from the DPoS
// precompile (read-only mainnet provider — no wallet):
//   inactive   total_stake == 0 (no stake — not participating)
//   slashed    eligible on-chain but eligibleVotes < expectedVotes (penalty decay)
//   ineligible has stake but isValidatorEligible == false (below the 5,000 threshold)
//   active     eligible on-chain and at full voting power
export default () => {
  const { mainnetDpos } = useDpos();

  const updateValidatorsSlashing = useCallback(
    async (validators: Validator[]): Promise<Validator[]> => {
      if (validators.length === 0 || !mainnetDpos) {
        return validators;
      }

      return Promise.all(
        validators.map(async (validator) => {
          try {
            const [votesRaw, eligibleRaw] = await Promise.all([
              mainnetDpos.getValidatorEligibleVotesCount(validator.address),
              mainnetDpos.isValidatorEligible(validator.address),
            ]);
            const eligibleVotes = BigNumber.from(votesRaw).toNumber();
            const expectedVotes = validator.delegation.div(VOTE_STEP).toNumber();
            const isEligibleOnchain = Boolean(eligibleRaw);
            const isSlashed = isEligibleOnchain && eligibleVotes < expectedVotes;

            let nodeState: NodeState;
            if (validator.delegation.isZero()) {
              nodeState = 'inactive';
            } else if (isSlashed) {
              nodeState = 'slashed';
            } else if (!isEligibleOnchain) {
              nodeState = 'ineligible';
            } else {
              nodeState = 'active';
            }

            return {
              ...validator,
              eligibleVotes,
              expectedVotes,
              isEligibleOnchain,
              isSlashed,
              nodeState,
            };
          } catch (e) {
            // Leave nodeState undefined so the UI shows "—" for this node rather
            // than a misleading verdict.
            // eslint-disable-next-line no-console
            console.error(`useSlashing: read failed for ${validator.address}:`, e);
            return validator;
          }
        }),
      );
    },
    [mainnetDpos],
  );

  // Total eligible voting power across the network (denominator for the gauge).
  const getTotalEligibleVotes = useCallback(async (): Promise<number> => {
    if (!mainnetDpos) {
      return 0;
    }
    try {
      const total = await mainnetDpos.getTotalEligibleVotesCount();
      return BigNumber.from(total).toNumber();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('useSlashing: getTotalEligibleVotesCount failed:', e);
      return 0;
    }
  }, [mainnetDpos]);

  return useMemo(
    () => ({ updateValidatorsSlashing, getTotalEligibleVotes }),
    [updateValidatorsSlashing, getTotalEligibleVotes],
  );
};
