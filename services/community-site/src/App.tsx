import React, { useEffect } from 'react';
import { BrowserRouter, Switch, Route, useLocation } from 'react-router-dom';
import { MetaMaskProvider } from 'metamask-react';
import { useMediaQuery } from 'react-responsive';
import { EblaThemeProvider } from '@ebla-network/ebla-ui';

import { AuthProvider } from './services/useAuth';
import { LoadingProvider } from './services/useLoading';
import { ModalProvider } from './services/useModal';
import { SidebarProvider } from './services/useSidebar';

import Header from './components/Header/Header';
import LoadingWidget from './components/LoadingWidget/LoadingWidget';
import Footer from './components/Footer/Footer';
import Sidebar from './components/Sidebar/Sidebar';

import Home from './pages/Home/Home';
import Staking from './pages/Staking/Delegation';
import RunValidator from './pages/RunNode/RunValidator';
import NetworkStatus from './pages/NetworkStatus/NetworkStatus';
import { WalletPopupProvider } from './services/useWalletPopup';

import './App.scss';
import { ValidatorWeeklyStatsProvider } from './services/useValidatorsWeeklyStats';
import { ValidatorsProvider } from './services/useAllValidators';
import { RedelegationProvider } from './services/useRedelegation';

declare global {
  interface Window {
    gtag: any;
  }
}

const Root = () => {
  const location = useLocation();
  const isMobile = useMediaQuery({ query: `(max-width: 760px)` });
  const isTablet = useMediaQuery({ query: `(max-width: 1421px)` });

  useEffect(() => {
    window.gtag('config', 'G-QEVR9SEH2J', {
      page_title: location.pathname,
      page_path: location.pathname,
    });
  }, [location]);

  let appClassName = 'App';

  if (isMobile) {
    appClassName += ' App-mobile';
  }

  if (isTablet) {
    appClassName += ' App-tablet';
  }

  return (
    <div className={appClassName}>
      <Header />
      <div className="App-Container">
        <Sidebar />
        <div className="App-Content">
          <div className="App-Page">
            <LoadingWidget />
            <Switch>
              <Route exact path="/delegation" component={Staking} />
              <Route exact path="/staking" component={Staking} />
              <Route exact path="/node" component={RunValidator} />
              <Route exact path="/network-status" component={NetworkStatus} />
              <Route exact path="/" component={Home} />
            </Switch>
          </div>
          <Footer />
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <MetaMaskProvider>
      <LoadingProvider>
        <AuthProvider>
          <BrowserRouter>
            <EblaThemeProvider>
              <ModalProvider>
                <WalletPopupProvider>
                  <SidebarProvider>
                    <ValidatorWeeklyStatsProvider>
                      <ValidatorsProvider>
                        <RedelegationProvider>
                          <Root />
                        </RedelegationProvider>
                      </ValidatorsProvider>
                    </ValidatorWeeklyStatsProvider>
                  </SidebarProvider>
                </WalletPopupProvider>
              </ModalProvider>
            </EblaThemeProvider>
          </BrowserRouter>
        </AuthProvider>
      </LoadingProvider>
    </MetaMaskProvider>
  );
}

export default App;
