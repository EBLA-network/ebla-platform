import React, { useState } from 'react';
import { useMediaQuery } from 'react-responsive';
import { useHistory, withRouter } from 'react-router-dom';

import { IconCard, ToggleButton, Notification } from '@ebla-network/ebla-ui';

import StakingIcon from '../../assets/icons/staking';
import NodeIcon from '../../assets/icons/node';
import ExplorerIcon from '../../assets/icons/explorer';
import DeployIcon from '../../assets/icons/deploy';

import Title from '../../components/Title/Title';

import './home.scss';

const Home: React.FC = () => {

  const history = useHistory();
  const isMobile = useMediaQuery({ query: `(max-width: 760px)` });
  const [toggleValue, setToggleValue] = useState('earn');

  const toggleOptions = [
    { value: 'earn', label: 'Earn' },
    { value: 'mainnet', label: 'Participate' },
  ];

  const onToggle = (event: React.MouseEvent<HTMLElement>, value: string) => {
    const options = toggleOptions.map((toggleOption) => toggleOption.value);
    if (options.includes(value)) {
      setToggleValue(value);
    }
  };

  return (
    <div className={isMobile ? 'home-mobile' : 'home'}>
      <div className="home-content">
        <Title title="Get started" subtitle="Welcome to EBLA's community site!" />
        {isMobile && (
          <ToggleButton
            exclusive
            onChange={onToggle}
            currentValue={toggleValue}
            data={toggleOptions}
            className="toggleButton"
          />
        )}
        <div
          className="notification"
          style={{
            display: isMobile && toggleValue !== 'earn' ? 'none' : 'inherit',
          }}
        >
          <Notification title="EARN" text="Earn rewards while helping us grow." variant="success" />
        </div>
        <div
          className="cardContainer"
          style={{
            display: isMobile && toggleValue !== 'earn' ? 'none' : isMobile ? 'inherit' : 'flex',
          }}
        >
          <IconCard
            title="Staking"
            description="Earn rewards and help secure the EBLA network."
            onClickText="Get Started"
            onClickButton={() => history.push('/staking')}
            Icon={StakingIcon}
          />
        </div>
        <div
          className="notification"
          style={{
            display: isMobile && toggleValue !== 'mainnet' ? 'none' : 'inherit',
          }}
        >
          <Notification
            title="Participate"
            text="Participate in EBLA`s public networks."
            variant="success"
          />
        </div>
        <div
          className="cardContainer"
          style={{
            display: isMobile && toggleValue !== 'mainnet' ? 'none' : isMobile ? 'inherit' : 'flex',
          }}
        >
          <IconCard
            title="Run a node"
            description="Earn rewards while helping to secure EBLA’s network."
            onClickText="Get Started"
            onClickButton={() => history.push('/node')}
            Icon={NodeIcon}
          />
          <IconCard
            title="EBLA explorer"
            description="Explore the ledger and find the transaction’s data."
            onClickText="Get Started"
            onClickButton={() =>
              window.open('https://explorer.eblanetwork.com/', '_blank', 'noreferrer noopener')
            }
            Icon={ExplorerIcon}
          />
          <IconCard
            title="Deploy DApps"
            description="Earn rewards while learning about EBLA and grow it’s ecosystem."
            onClickText="Get Started"
            onClickButton={() =>
              window.open('https://www.eblanetwork.com/build/', '_blank', 'noreferrer noopener')
            }
            Icon={DeployIcon}
          />
        </div>
      </div>
    </div>
  );
};

export default withRouter(Home);
