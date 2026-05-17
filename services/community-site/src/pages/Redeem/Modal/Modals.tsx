import React from 'react';
import { Modal } from '@ebla-network/ebla-ui';
import { ethers } from 'ethers';
import { formatEth, roundEth, weiToEth } from '../../../utils/eth';
import CloseIcon from '../../../assets/icons/close';
import RedeemWarning from './RedeemWarning';

export interface RedeemModalsProps {
  warningModal: boolean;
  onWarningModalClose: () => void;
  onWarningModalAccept: () => void;
  eblaAmount: ethers.BigNumber;
}

const RedeemModals = (props: RedeemModalsProps) => {
  const { warningModal, onWarningModalClose, onWarningModalAccept, eblaAmount } = props;
  return (
    <>
      {warningModal && (
        <Modal
          id="warningModal"
          title={`You are redeeming ${eblaAmount} EBLA`}
          show={warningModal}
          children={
            <RedeemWarning
              amount={formatEth(roundEth(weiToEth(eblaAmount)))}
              onDenial={onWarningModalClose}
              onAccept={onWarningModalAccept}
            />
          }
          parentElementID="root"
          onRequestClose={() => onWarningModalClose()}
          closeIcon={CloseIcon}
        />
      )}
    </>
  );
};

export default RedeemModals;
