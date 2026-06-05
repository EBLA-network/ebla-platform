import { useCallback, useMemo } from 'react';
import { BigNumber } from 'ethers';
import useDpos from './useDpos';
import { Validator } from '../interfaces/Validator';

// Each 1,000 EBLA of stake grants one eligible consensus vote, so a healthy
// eligible validator has eligibleVotes === floor(stake / 1,000 EBLA). Inactivity
// slashing reduces a validator's eligible vote count below that expected value,
// so eligibleVotes < expectedVotes flags a slashed node.
const VOTE_STEP = BigNumber.from(1_000).mul(BigNumber.from(10).pow(18));

// Below 5,000 EBLA a validator is not consensus-eligible, so a low vote count is
// expected there and must not be reported as slashing (EBLA Core Spec
// `eligibility_balance_threshold`).
const ELIGIBILITY_THRESHOLD = BigNumber.from(5_000).mul(BigNumber.from(10).pow(18));

// Enriches each validator with its slashing state by reading the DPoS
// precompile's eligible-vote count (one read per eligible validator) and
// comparing it against the stake-derived expected count. The read uses the
// mainnet (read-only) provider, so no wallet connection is required.
export default () => {
  const { mainnetDpos } = useDpos();

  const updateValidatorsSlashing = useCallback(
    async (validators: Validator[]): Promise<Validator[]> => {
      if (validators.length === 0 || !mainnetDpos) {
        return validators;
      }

      return Promise.all(
        validators.map(async (validator) => {
          // Sub-threshold validators are not eligible to vote, so slashing does
          // not apply — report them as not slashed without an extra RPC call.
          if (validator.delegation.lt(ELIGIBILITY_THRESHOLD)) {
            return { ...validator, eligibleVotes: 0, expectedVotes: 0, isSlashed: false };
          }

          try {
            const votes: BigNumber = await mainnetDpos.getValidatorEligibleVotesCount(
              validator.address,
            );
            const eligibleVotes = votes.toNumber();
            const expectedVotes = validator.delegation.div(VOTE_STEP).toNumber();
            return {
              ...validator,
              eligibleVotes,
              expectedVotes,
              isSlashed: eligibleVotes < expectedVotes,
            };
          } catch (e) {
            // Leave isSlashed undefined so the UI shows an "unknown" state for
            // this node rather than a misleading OK / Slashed verdict.
            // eslint-disable-next-line no-console
            console.error(`useSlashing: eligible-votes read failed for ${validator.address}:`, e);
            return validator;
          }
        }),
      );
    },
    [mainnetDpos],
  );

  return useMemo(() => ({ updateValidatorsSlashing }), [updateValidatorsSlashing]);
};
