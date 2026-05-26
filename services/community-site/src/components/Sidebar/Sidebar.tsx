import React, { useEffect } from 'react';
import { withRouter, useHistory } from 'react-router-dom';
import { useMediaQuery } from 'react-responsive';
import { Button, Sidebar as MSidebar } from '@ebla-network/ebla-ui';
import useCMetamask from '../../services/useCMetamask';

import StakingSidebar from '../../assets/icons/stakingSidebar';
import DeploySidebar from '../../assets/icons/deploySidebar';
import ExplorerSidebar from '../../assets/icons/explorerSidebar';
import GetStarted from '../../assets/icons/getStarted';
import NodeSidebar from '../../assets/icons/nodeSidebar';
import HamburgerIcon from '../../assets/icons/hamburger';

import NavLink from '../NavLink/NavLink';

import { useSidebar } from '../../services/useSidebar';

import './sidebar.scss';

const Sidebar = () => {
  const { listen } = useHistory();
  const { status, connect } = useCMetamask();
  const isMobile = useMediaQuery({ query: `(max-width: 760px)` });

  const { isOpen, close } = useSidebar();

  useEffect(() => {
    const unlisten = listen(() => {
      if (isOpen) {
        close!();
      }
    });

    return unlisten;
  }, [listen, isOpen, close]);

  const menu = [
    {
      Link: <NavLink label="Get Started" Icon={GetStarted} to="/" />,
      name: 'dashboard',
    },
    {
      label: 'Earn',
      items: [
        {
          Link: <NavLink label="Staking" Icon={StakingSidebar} to="/staking" />,
          name: 'staking',
        },
      ],
    },
    {
      name: 'mainnet',
      label: 'Participate',
      items: [
        {
          Link: <NavLink label="Run a node" Icon={NodeSidebar} to="/node" />,
          name: 'node',
        },
        {
          Link: (
            <NavLink
              label="EBLA Explorer"
              Icon={ExplorerSidebar}
              to={{ pathname: 'https://explorer.eblanetwork.com/' }}
              target="_blank"
              rel="noopener noreferrer"
            />
          ),
        },
        {
          Link: (
            <NavLink
              label="Deploy DApps"
              Icon={DeploySidebar}
              to={{ pathname: 'https://www.eblanetwork.com/build/' }}
              target="_blank"
              rel="noopener noreferrer"
            />
          ),
        },
      ],
    },
  ];

  const mobileButtons = (
    <>
      {status === 'notConnected' && (
        <Button
          label="Connect Wallet"
          variant="outlined"
          color="primary"
          fullWidth
          onClick={async () => {
            try {
              await connect();
              close!();
            } catch (e) {}
          }}
        />
      )}
    </>
  );

  const hamburger = (
    <div className="hamburger" style={{ cursor: 'pointer' }} onClick={() => close!()}>
      <HamburgerIcon />
    </div>
  );

  return (
    <MSidebar disablePadding dense items={menu} open={isOpen} onClose={() => close!()}>
      {hamburger}
      {isMobile && mobileButtons}
    </MSidebar>
  );
};

export default withRouter(Sidebar);
