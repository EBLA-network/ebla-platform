import { ProgressBar, Box } from '@ebla-network/ebla-ui';
import { HoldersTableData } from '../../models';
import { HashLink, AddressLabel } from '../../components';
import { HashLinkType } from '../../utils';
import { BigNumber, utils } from 'ethers';

export const toHolderTableRow = ({
  rank,
  address,
  label,
  balance,
  totalSupply,
  eblaPrice,
}: HoldersTableData): {
  rank: number;
  address: JSX.Element;
  balanceStr: string;
  percentage: JSX.Element;
  value: string;
} => {
  const addressLink = (
    <>
      <HashLink linkType={HashLinkType.ADDRESSES} width='auto' hash={address} />
      {label && (
        <Box mt={1}>
          <AddressLabel label={label} />
        </Box>
      )}
    </>
  );
  // We need to multiply by an additional 100 to get some precision back from bignumber
  // Original formula should be balance * 100 / totalSupply
  // But the improved one that returns for smaller holders too is: balance * 100 * 100 / totalSupply
  const _balance = BigNumber.from(balance);
  const _totalSupply = BigNumber.from(totalSupply);
  // Guard against a zero/unset total supply (e.g. still loading, or the
  // /totalSupply request not yet resolved): ethers' BigNumber.div(0) throws,
  // which would crash the entire Holders page to a blank screen.
  const percentageRaw = _totalSupply.isZero()
    ? BigNumber.from(0)
    : _balance.mul(BigNumber.from(10000)).mul(100).div(_totalSupply);
  // We divide back by 10000 to get the floating point percentage
  const percentageNumber = parseFloat(percentageRaw.toString()) / 10000;
  const percentageWithFourDecimals = percentageNumber.toFixed(4);
  const percentageBar = <ProgressBar percentage={percentageWithFourDecimals} />;
  const etherBalance = utils.formatEther(balance);
  const value = `$${(
    Number.parseFloat(etherBalance) * eblaPrice
  ).toLocaleString('USD')}`;
  return {
    rank,
    address: addressLink,
    balanceStr: utils.commify(utils.formatEther(balance)),
    percentage: percentageBar,
    value,
  };
};
