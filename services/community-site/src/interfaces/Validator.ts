import { ethers } from 'ethers';

export enum ValidatorStatus {
  NOT_ELIGIBLE = 'not-eligible',
  ELIGIBLE_INACTIVE = 'eligible-inactive',
  ELIGIBLE = 'eligible',
}

// Authoritative on-chain node state, derived in useSlashing from the DPoS
// precompile (isValidatorEligible + eligible/expected votes + total_stake).
export type NodeState = 'active' | 'slashed' | 'ineligible' | 'inactive';

export interface Validator {
  address: string;
  owner: string;
  commission: number;
  commissionReward: ethers.BigNumber;
  lastCommissionChange: number;
  delegation: ethers.BigNumber;
  availableForDelegation: ethers.BigNumber;
  description: string;
  endpoint: string;
  isFullyDelegated: boolean;
  isActive: boolean;
  status: ValidatorStatus;
  rank: number;
  pbftsProduced: number;
  yield: number;
  registrationBlock: number;
  ip?: string;
  id?: number;
  // On-chain status, filled by useSlashing (undefined until the reads resolve).
  // isSlashed is true when an eligible validator's eligibleVotes < expectedVotes.
  isSlashed?: boolean;
  eligibleVotes?: number;
  expectedVotes?: number;
  isEligibleOnchain?: boolean;
  nodeState?: NodeState;
}

export interface ValidatorApi {
  address: string;
  owner: string;
  commission: number;
  commissionReward: ethers.BigNumber;
  lastCommissionChange: ethers.BigNumber;
  delegation: ethers.BigNumber;
  description: string;
  endpoint: string;
}

export const getValidatorStatusTooltip = (status: ValidatorStatus) => {
  switch (status) {
    case ValidatorStatus.ELIGIBLE:
      return 'Eligible';
    case ValidatorStatus.ELIGIBLE_INACTIVE:
      return 'Eligible but hasn`t produced blocks in the last 24 hours';
    case ValidatorStatus.NOT_ELIGIBLE:
      return 'Not eligible';
    default:
      return 'Not eligible';
  }
};
