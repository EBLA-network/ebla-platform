import React from 'react';
import { useMediaQuery } from 'react-responsive';
import { Header as THeader } from '@ebla-network/ebla-ui';

import EblaIcon from '../../assets/icons/eblaIcon';
import HamburgerIcon from '../../assets/icons/hamburger';

import { useSidebar } from '../../services/useSidebar';

import Wallet from '../Wallet';
import './header.scss';

const Header = () => {
  const { open } = useSidebar();
  const isMobile = useMediaQuery({ query: `(max-width: 760px)` });

  const hamburger = (
    <div style={{ cursor: 'pointer' }} onClick={() => open!()}>
      <HamburgerIcon />
    </div>
  );

  return (
    <THeader
      title="EBLA Community"
      className="header"
      color="primary"
      position="relative"
      Icon={EblaIcon}
      elevation={0}
    >
      <Wallet />
      {isMobile && hamburger}
    </THeader>
  );
};

export default Header;
