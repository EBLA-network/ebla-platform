import React, { useState } from 'react';
import { ethers } from 'ethers';
import { Button, Text, InputField } from '@ebla-network/ebla-ui';

import useValidators from '../../../services/useValidators';
import { useWalletPopup } from '../../../services/useWalletPopup';

const RegisterNode = ({
  balance,
  onSuccess,
  onClose,
}: {
  balance: ethers.BigNumber;
  onSuccess: () => void;
  onClose: () => void;
}) => {
  const minimumRequiredBalance = ethers.utils.parseUnits('1000', 'ether');
  const { registerValidator } = useValidators();
  const { asyncCallback } = useWalletPopup();

  const [error, setError] = useState('');
  const [address, setAddress] = useState('');
  const [addressError, setAddressError] = useState('');
  const [addressProof, setAddressProof] = useState('');
  const [addressProofError, setAddressProofError] = useState('');
  const [vrfKey, setVrfKey] = useState('');
  const [vrfKeyError, setVrfKeyError] = useState('');
  const [commission, setCommission] = useState('');
  const [commissionError, setCommissionError] = useState('');

  const submit = (event: React.MouseEvent<HTMLElement> | React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError('');
    setAddressError('');
    setAddressProofError('');
    setVrfKeyError('');
    setCommissionError('');

    if (!address) {
      setAddressError('Node public address is required!');
      return;
    }
    if (!address.startsWith('0x')) {
      setAddressError('Node public address must start with 0x');
      return;
    }
    if (!addressProof) {
      setAddressProofError('Proof of ownership is required!');
      return;
    }
    if (!addressProof.startsWith('0x')) {
      setAddressProofError('Proof of ownership must start with 0x');
      return;
    }
    if (!vrfKey) {
      setVrfKeyError('VRF Public Key is required!');
      return;
    }
    if (!vrfKey.startsWith('0x')) {
      setVrfKeyError('VRF Public Key must start with 0x');
      return;
    }
    if (balance.lt(minimumRequiredBalance)) {
      setError('You don`t have enough balance to register a new validator');
      return;
    }
    if (!commission) {
      setCommissionError('Commission is required!');
      return;
    }
    const commissionValue = parseInt(commission, 10);
    if (!/^\d+$/.test(commission.trim()) || commissionValue < 10 || commissionValue > 100) {
      setCommissionError('Commission must be a whole number between 10 and 100 (minimum is 10%).');
      return;
    }

    asyncCallback(async () => {
      onClose();
      return registerValidator(address, addressProof, vrfKey, commissionValue, '', '');
    }, onSuccess);
  };

  return (
    <>
      <div>
        <Text
          style={{
            marginBottom: '2%',
            fontFamily: 'Inter, san-serif',
            fontSize: '18px',
          }}
          label="Register a node"
          variant="h6"
          color="primary"
        />
        <form onSubmit={submit}>
          <InputField
            label="Node public address"
            error={!!addressError}
            helperText={addressError}
            value={address}
            variant="outlined"
            type="text"
            fullWidth
            margin="normal"
            onChange={(event) => {
              setAddress(event.target.value);
            }}
          />
          <InputField
            label="Proof of node ownership"
            error={!!addressProofError}
            helperText={addressProofError}
            value={addressProof}
            variant="outlined"
            type="text"
            fullWidth
            margin="normal"
            onChange={(event) => {
              setAddressProof(event.target.value);
            }}
          />
          <InputField
            label="VRF Public Key"
            error={!!vrfKeyError}
            helperText={vrfKeyError}
            value={vrfKey}
            variant="outlined"
            type="text"
            fullWidth
            margin="normal"
            onChange={(event) => {
              setVrfKey(event.target.value);
            }}
          />
          <InputField
            label="Commission (%)"
            error={!!commissionError}
            helperText={commissionError || 'Whole number between 10 and 100 (minimum is 10%)'}
            value={commission}
            variant="outlined"
            type="text"
            fullWidth
            margin="normal"
            onChange={(event) => {
              setCommission(event.target.value);
            }}
          />
          {error && (
            <Text variant="body1" color="error">
              {error}
            </Text>
          )}
          <Button
            type="submit"
            label="Submit"
            color="secondary"
            variant="contained"
            className="marginButton"
            onClick={submit}
            fullWidth
          />
        </form>

        <Text style={{ margin: '5% 0' }} label="References:" variant="body1" color="primary" />

        <Button
          label="How to find my node's address?"
          variant="outlined"
          color="secondary"
          className="node-control-reference-button"
          onClick={() =>
            window.open(
              `https://docs.eblanetwork.com/node-setup/node_address`,
              '_blank',
              'noreferrer noopener',
            )
          }
          fullWidth
        />
        <Button
          label="How to find my node's VRF public key?"
          variant="outlined"
          color="secondary"
          className="node-control-reference-button"
          onClick={() =>
            window.open(
              `https://docs.eblanetwork.com/node-setup/vrf_key`,
              '_blank',
              'noreferrer noopener',
            )
          }
          fullWidth
        />
        <Button
          label="How do I get the proof of owership?"
          variant="outlined"
          color="secondary"
          className="node-control-reference-button"
          onClick={() =>
            window.open(
              `https://docs.eblanetwork.com/node-setup/proof_owership`,
              '_blank',
              'noreferrer noopener',
            )
          }
          fullWidth
        />
      </div>
    </>
  );
};

export default RegisterNode;
