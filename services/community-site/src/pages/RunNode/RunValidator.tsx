import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import {
  Notification,
  Text,
  Button,
  IconCard,
  BaseCard,
  Tooltip,
  Modal,
  EmptyTable,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@ebla-network/ebla-ui';
import useCMetamask from '../../services/useCMetamask';
import useMainnet from '../../services/useMainnet';
import useChain from '../../services/useChain';
import useEblaApi from '../../services/useEblaApi';

import NodeIcon from '../../assets/icons/node';
import InfoIcon from '../../assets/icons/info';

import Title from '../../components/Title/Title';
import WrongNetwork from '../../components/WrongNetwork';

import { Validator } from '../../interfaces/Validator';

import RunValidatorModal from './Modal';
import References from './References';
import MainnetValidatorRow from './Table/MainnetValidatorRow';

import './runvalidator.scss';
import CloseIcon from '../../assets/icons/close';
import Claim from '../Staking/Modal/Claim';
import UpdateValidator from './Screen/UpdateValidator';
import { useAllValidators } from '../../services/useAllValidators';

const RunValidator = () => {
  const { chainId, provider } = useChain();
  const { status, account } = useCMetamask();
  const { chainId: mainnetChainId } = useMainnet();

  const { getValidatorsFor } = useEblaApi();
  const { allValidatorsWithStats } = useAllValidators();

  const isOnWrongChain = chainId !== mainnetChainId;

  const [isOpenRegisterValidatorModal, setIsOpenRegisterValidatorModal] = useState(false);
  const [balance, setBalance] = useState(ethers.BigNumber.from('0'));
  const [validators, setValidators] = useState<Validator[]>([]);
  const [validatorToUpdate, setValidatorToUpdate] = useState<Validator | null>(null);
  const [validatorToClaimFrom, setValidatorToClaimFrom] = useState<Validator | null>(null);
  const [fetchCounter, setFetchCounter] = useState<number>(0);

  const openRegisterValidatorModal = () => setIsOpenRegisterValidatorModal(true);
  const closeRegisterValidatorModal = () => setIsOpenRegisterValidatorModal(false);

  const fetchBalance = async () => {
    if (status === 'connected' && account && provider) {
      setBalance(await provider.getBalance(account));
    }
  };

  useEffect(() => {
    const intervalBalancePeriod = 8000;
    const intervalFetchBalance = setInterval(() => {
      fetchBalance();
    }, intervalBalancePeriod);
    return () => {
      clearInterval(intervalFetchBalance);
    };
  }, [status, account, chainId, fetchCounter]);

  // Registered validators are read on-chain via getValidatorsFor(account), then
  // enriched with the indexer-backed stats (status / yield / rank / pbftsProduced)
  // already fetched for the full validator set.
  const fetchValidators = () => {
    if (status === 'connected' && account) {
      (async () => {
        const myValidators = await getValidatorsFor(account);
        const validatorsWithStats: Validator[] = myValidators.map((v) => {
          const enriched = allValidatorsWithStats.find((s) => s.address === v.address);
          return { ...v, ...enriched } as Validator;
        });
        setValidators(validatorsWithStats);
      })();
    }
  };

  useEffect(() => {
    fetchValidators();
  }, [status, account, fetchCounter, allValidatorsWithStats]);

  const canRegisterValidator = !isOnWrongChain && status === 'connected' && !!account;
  const activeValidators = validators.filter((v) => v.isActive).length;

  if (validatorToUpdate) {
    return (
      <UpdateValidator
        validator={validatorToUpdate}
        closeEditValidator={(refreshValidators) => {
          setValidatorToUpdate(null);
          if (refreshValidators) {
            fetchValidators();
          }
        }}
      />
    );
  }

  return (
    <div className="runnode">
      {validatorToClaimFrom && (
        <Modal
          id="delegateModal"
          title="Claim from..."
          show={!!validatorToClaimFrom}
          children={
            <Claim
              amount={validatorToClaimFrom.commissionReward}
              validator={validatorToClaimFrom}
              onSuccess={() => setValidatorToClaimFrom(null)}
              onFinish={() => setValidatorToClaimFrom(null)}
              commissionMode
            />
          }
          parentElementID="root"
          onRequestClose={() => setValidatorToClaimFrom(null)}
          closeIcon={CloseIcon}
        />
      )}
      <RunValidatorModal
        balance={balance}
        isOpen={isOpenRegisterValidatorModal}
        onClose={() => closeRegisterValidatorModal()}
        onSuccess={() => {
          setFetchCounter((prev) => prev + 1);
          closeRegisterValidatorModal();
        }}
      />
      <div className="runnode-content">
        {status !== 'connected' && (
          <div className="notification">
            <Notification
              title="Notice:"
              text="You need to connect to your Metamask wallet in order to register nodes."
              variant="danger"
            />
          </div>
        )}
        {status === 'connected' && isOnWrongChain && (
          <div className="notification">
            <Notification
              title="Notice:"
              text="You need to be connected to the EBLA network in order to register a node."
              variant="danger"
            >
              <WrongNetwork />
            </Notification>
          </div>
        )}
        <Title title="Running a Node" />
        <div className="nodeTypes">
          <div className="nodeTitleContainer">
            <NodeIcon />
            <Text label="My nodes" variant="h6" color="primary" className="box-title" />
          </div>
          <Button
            size="small"
            className="registerNode"
            label="Register a node"
            variant="contained"
            color="secondary"
            disabled={!canRegisterValidator}
            onClick={() => openRegisterValidatorModal()}
          />
        </div>
        <div className="cardContainer">
          {validators.length > 0 && (
            <BaseCard
              title={activeValidators.toString()}
              description="Active nodes"
              tooltip={
                <Tooltip
                  title="A node is considered active if it produced at least one block this week."
                  Icon={InfoIcon}
                />
              }
            />
          )}
          {validators.length === 0 && (
            <>
              <IconCard
                title="Register a node"
                description="Register a node you’ve aleady set up."
                onClickText="Register a node"
                onClickButton={() => openRegisterValidatorModal()}
                Icon={NodeIcon}
                disabled={!canRegisterValidator}
              />
              <IconCard
                title="Set up a node"
                description="Learn how to set up a node on EBLA."
                onClickText="Set up a node"
                onClickButton={() =>
                  window.open(
                    'https://docs.eblanetwork.com/node-setup/testnet_node_setup',
                    '_blank',
                    'noreferrer noopener',
                  )
                }
                Icon={NodeIcon}
              />
            </>
          )}
        </div>
        <TableContainer className="validatorsTableContainer">
          <Table className="validatorsTable">
            <TableHead>
              <TableRow>
                <TableCell className="statusCell">Status</TableCell>
                <TableCell className="nameCell">Address / Nickname</TableCell>
                <TableCell className="yieldCell">Yield Efficiency</TableCell>
                <TableCell className="commissionCell">Commission</TableCell>
                <TableCell className="delegationCell">Delegation</TableCell>
                <TableCell className="availableDelegation">Available for Delegation</TableCell>
                <TableCell className="rankingCell">Ranking</TableCell>
                <TableCell className="rewardsCell">Commission Rewards</TableCell>
                <TableCell className="actionsCell">&nbsp;</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {validators.length > 0 ? (
                validators.map((v: Validator) => (
                  <MainnetValidatorRow
                    key={v.address}
                    validator={v}
                    actionsDisabled={status !== 'connected' || !account}
                    setValidatorInfo={setValidatorToUpdate}
                    setCommissionClaim={setValidatorToClaimFrom}
                  />
                ))
              ) : (
                <EmptyTable
                  colspan={9}
                  message="Looks like you haven`t registered any validators yet..."
                />
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <References
          canRegisterValidator={canRegisterValidator}
          openRegisterValidatorModal={() => openRegisterValidatorModal()}
        />
      </div>
    </div>
  );
};

export default RunValidator;
