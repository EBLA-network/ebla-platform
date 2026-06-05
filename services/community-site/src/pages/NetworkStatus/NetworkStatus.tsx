import React, { useCallback, useEffect, useState } from 'react';
import clsx from 'clsx';
import { ethers } from 'ethers';
import {
  MuiTooltip,
  Text,
  BaseCard,
  Divider,
  LoadingTable,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useInterval,
} from '@ebla-network/ebla-ui';

import Title from '../../components/Title/Title';
import Nickname from '../../components/Nickname/Nickname';
import VotingPowerGauge from './VotingPowerGauge';

import { useLoading } from '../../services/useLoading';
import { useAllValidators } from '../../services/useAllValidators';
import useSlashing from '../../services/useSlashing';

import { Validator, NodeState } from '../../interfaces/Validator';
import { weiToEth } from '../../utils/eth';

import './networkstatus.scss';

const STATE_META: Record<NodeState, { label: string; tip: string }> = {
  active: { label: 'Active', tip: 'Eligible and voting at full power.' },
  slashed: {
    label: 'Slashed',
    tip: 'Voting power reduced by the inactivity penalty (votes below the stake-implied count).',
  },
  ineligible: {
    label: 'Ineligible',
    tip: 'Has stake but is below the 5,000 EBLA eligibility threshold.',
  },
  inactive: { label: 'Inactive', tip: 'No stake — not participating in consensus.' },
};

// EBLA PBFT certifies a block only with >= 5/8 of voting power, so the network
// stalls once active voting power falls below this line.
const QUORUM_THRESHOLD = 0.625;
const REFRESH_MS = 15000;

const SUBTITLE =
  'Live, read-only view of every node, its on-chain state, and the voting-power safety margin.';
const QUORUM_NOTE =
  'EBLA PBFT finalizes a block only with at least 5/8 (62.5%) of voting power. ' +
  'If active power falls below the red line — dead/slashed power reaching 3/8 — ' +
  'the network can no longer reach quorum.';

const NetworkStatus = () => {
  const { isLoading } = useLoading();
  const { allValidatorsWithStats } = useAllValidators();
  const { updateValidatorsSlashing, getTotalEligibleVotes } = useSlashing();

  const [validators, setValidators] = useState<Validator[]>([]);
  const [totalVotes, setTotalVotes] = useState(0);

  // Re-read each node's eligibility + vote count and the network total directly
  // from the DPoS precompile. Runs on load and on an interval so the gauge is live.
  const refreshOnchain = useCallback(async () => {
    if (allValidatorsWithStats.length === 0) {
      return;
    }
    const [withState, total] = await Promise.all([
      updateValidatorsSlashing(allValidatorsWithStats),
      getTotalEligibleVotes(),
    ]);
    setValidators(withState);
    setTotalVotes(total);
  }, [allValidatorsWithStats, updateValidatorsSlashing, getTotalEligibleVotes]);

  useEffect(() => {
    setValidators(allValidatorsWithStats);
  }, [allValidatorsWithStats]);

  useEffect(() => {
    refreshOnchain();
  }, [refreshOnchain]);

  useInterval(() => {
    refreshOnchain();
  }, REFRESH_MS);

  const totalNodes = validators.length;
  const activeNodes = validators.filter((v) => v.nodeState === 'active').length;
  const slashedNodes = validators.filter((v) => v.nodeState === 'slashed').length;

  // Voting power that is fully healthy (eligible + not slashed). Everything else
  // counted in the on-chain total is treated as at-risk for the quorum gauge.
  const activeVotes = validators.reduce(
    (sum, v) => (v.nodeState === 'active' ? sum + (v.eligibleVotes || 0) : sum),
    0,
  );

  const renderState = (v: Validator) => {
    if (!v.nodeState) {
      return <span className="stateBadge unknown">—</span>;
    }
    const meta = STATE_META[v.nodeState];
    return (
      <MuiTooltip title={meta.tip}>
        <span className={clsx('stateBadge', v.nodeState)}>{meta.label}</span>
      </MuiTooltip>
    );
  };

  const renderVotingPower = (v: Validator) => {
    if (v.eligibleVotes === undefined) {
      return '—';
    }
    const pct = totalVotes > 0 ? ` (${((v.eligibleVotes / totalVotes) * 100).toFixed(1)}%)` : '';
    return `${v.eligibleVotes.toLocaleString()}${pct}`;
  };

  return (
    <div className="runnode">
      <div className="runnode-content">
        <Title title="Network Status" subtitle={SUBTITLE} />

        <div className="vpSection">
          <div className="vpSection-head">
            <Text label="Voting power vs 5/8 quorum" variant="h6" color="primary" />
            <span className="liveTag">
              <i className="liveDot" /> LIVE
            </span>
          </div>
          <VotingPowerGauge
            totalVotes={totalVotes}
            activeVotes={activeVotes}
            thresholdPct={QUORUM_THRESHOLD}
            isLoading={isLoading}
          />
          <Text
            className="vpSection-note"
            variant="body2"
            color="textSecondary"
            label={QUORUM_NOTE}
          />
        </div>

        <div className="delegationCardContainer">
          <BaseCard
            title={totalNodes > 0 ? totalNodes.toString() : '0'}
            description="Total network nodes"
            isLoading={isLoading}
          />
          <BaseCard
            title={activeNodes.toString()}
            description="Active nodes"
            isLoading={isLoading}
          />
          <BaseCard
            title={slashedNodes.toString()}
            description="Slashed nodes"
            isLoading={isLoading}
          />
        </div>

        {totalNodes === 0 && !isLoading && (
          <Text
            label="No nodes found on the network."
            variant="h6"
            color="primary"
            style={{ marginLeft: '20px', marginTop: '20px' }}
          />
        )}

        {isLoading ? (
          <div
            style={{ display: 'flex', justifyContent: 'center', width: '100%', marginTop: '2rem' }}
          >
            <Divider />
            <LoadingTable rows={10} cols={7} tableWidth="100%" />
          </div>
        ) : (
          totalNodes > 0 && (
            <TableContainer className="validatorsTableContainer">
              <Table className="validatorsTable">
                <TableHead>
                  <TableRow>
                    <TableCell className="statusCell">Status</TableCell>
                    <TableCell className="nameCell">Address / Nickname</TableCell>
                    <TableCell className="yieldCell">Yield Efficiency</TableCell>
                    <TableCell className="commissionCell">Commission</TableCell>
                    <TableCell className="delegationCell">Delegation</TableCell>
                    <TableCell className="votingPowerCell">Voting Power</TableCell>
                    <TableCell className="stateCell">State</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {validators.map((v) => (
                    <TableRow key={v.address}>
                      <TableCell className="statusCell">
                        <MuiTooltip title={v.nodeState ? STATE_META[v.nodeState].tip : 'Loading…'}>
                          <div className="status">
                            <div className={clsx('dot', v.nodeState && `state-${v.nodeState}`)} />
                          </div>
                        </MuiTooltip>
                      </TableCell>
                      <TableCell className="nameCell">
                        <div className="flexCell">
                          <Nickname showIcon address={v.address} description={v.description} />
                        </div>
                      </TableCell>
                      <TableCell className="yieldCell">{v.yield || 0}%</TableCell>
                      <TableCell className="commissionCell">{`${v.commission}%`}</TableCell>
                      <TableCell className="delegationCell">
                        {ethers.utils.commify(weiToEth(v.delegation))}
                      </TableCell>
                      <TableCell className="votingPowerCell">{renderVotingPower(v)}</TableCell>
                      <TableCell className="stateCell">{renderState(v)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )
        )}
      </div>
    </div>
  );
};

export default NetworkStatus;
