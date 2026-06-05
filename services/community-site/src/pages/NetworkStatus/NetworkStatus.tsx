import React, { useEffect, useState } from 'react';
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
} from '@ebla-network/ebla-ui';

import Title from '../../components/Title/Title';
import Nickname from '../../components/Nickname/Nickname';

import { useLoading } from '../../services/useLoading';
import { useAllValidators } from '../../services/useAllValidators';
import useSlashing from '../../services/useSlashing';

import { Validator, getValidatorStatusTooltip } from '../../interfaces/Validator';
import { weiToEth } from '../../utils/eth';

import './networkstatus.scss';

// Read-only overview of every node on the network and whether it has been
// slashed. The validator list is shared (loaded once via useAllValidators); this
// page only adds the per-node slashing read on top, so no wallet is required.
const NetworkStatus = () => {
  const { isLoading } = useLoading();
  const { allValidatorsWithStats } = useAllValidators();
  const { updateValidatorsSlashing } = useSlashing();

  const [validators, setValidators] = useState<Validator[]>([]);

  // Render the on-chain validator list as soon as it is available, then enrich
  // each row with its slashing state (an extra eligible-votes read per node).
  useEffect(() => {
    setValidators(allValidatorsWithStats);
  }, [allValidatorsWithStats]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (allValidatorsWithStats.length === 0) {
        return;
      }
      const withSlashing = await updateValidatorsSlashing(allValidatorsWithStats);
      if (!cancelled) {
        setValidators(withSlashing);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [allValidatorsWithStats, updateValidatorsSlashing]);

  const totalNodes = validators.length;
  const activeNodes = validators.filter((v) => v.isActive).length;
  const slashedNodes = validators.filter((v) => v.isSlashed).length;

  const renderSlashBadge = (validator: Validator) => {
    if (validator.isSlashed === undefined) {
      return <span className="slashBadge unknown">—</span>;
    }
    return validator.isSlashed ? (
      <span className="slashBadge slashed">Slashed</span>
    ) : (
      <span className="slashBadge ok">OK</span>
    );
  };

  return (
    <div className="runnode">
      <div className="runnode-content">
        <Title
          title="Network Status"
          subtitle="Live, read-only view of every EBLA node and its slashing state."
        />
        <div className="delegationCardContainer">
          <BaseCard
            title={totalNodes > 0 ? totalNodes.toString() : '0'}
            description="Total network nodes"
            isLoading={isLoading}
          />
          <BaseCard
            title={activeNodes.toString()}
            description="Active nodes producing blocks"
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
            <LoadingTable rows={10} cols={6} tableWidth="100%" />
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
                    <TableCell className="slashedCell">Slashing</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {validators.map((validator) => (
                    <TableRow key={validator.address}>
                      <TableCell className="statusCell">
                        <MuiTooltip title={getValidatorStatusTooltip(validator.status)}>
                          <div className="status">
                            <div className={clsx('dot', validator.status)} />
                          </div>
                        </MuiTooltip>
                      </TableCell>
                      <TableCell className="nameCell">
                        <div className="flexCell">
                          <Nickname
                            showIcon
                            address={validator.address}
                            description={validator.description}
                          />
                        </div>
                      </TableCell>
                      <TableCell className="yieldCell">{validator.yield || 0}%</TableCell>
                      <TableCell className="commissionCell">{`${validator.commission}%`}</TableCell>
                      <TableCell className="delegationCell">
                        {ethers.utils.commify(weiToEth(validator.delegation))}
                      </TableCell>
                      <TableCell className="slashedCell">{renderSlashBadge(validator)}</TableCell>
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
