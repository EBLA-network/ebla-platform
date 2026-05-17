import { BigNumber, ethers, utils } from 'ethers';

export const MIN_WEI_TO_CONVERT = Math.pow(10, 3);

export const fromWeiToEbla = (amount: string | number | BigNumber): string => {
  if (!amount) {
    return;
  }
  const result = Number(ethers.utils.formatEther(amount));
  return result === 0 || result % 1 === 0
    ? `${result}`
    : parseFloat(result?.toFixed(4))?.toString();
};

export const balanceWeiToEbla = (amount: string): string => {
  if (!amount) {
    return;
  }
  const balanceBigNumber = ethers.BigNumber.from(amount);
  const balance = utils.commify(utils.formatEther(balanceBigNumber));
  return balance;
};

export const formatBalance = (balance: string): string => {
  if (!balance) {
    return balance;
  }
  const balanceNumber = parseFloat(balance);
  const balanceFormatted = balanceNumber.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 18,
  });
  return balanceFormatted;
};

export const displayWeiOrEbla = (
  amount: string | number | BigNumber
): string => {
  if (amount !== undefined && amount !== null) {
    return Number(amount) < MIN_WEI_TO_CONVERT
      ? `${amount} Wei`
      : `${fromWeiToEbla(ethers.BigNumber.from(amount))} EBLA`;
  }
  return 'NA';
};
