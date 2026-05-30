interface Network {
  chainName: string;
  rpcUrl: string;
  iconUrl: string;
  blockExplorerUrl: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  indexerUrl: string;
}
interface Networks {
  [key: number]: Network;
}
export const networks: Networks = {
  60186: {
    chainName: 'EBLA Mainnet',
    rpcUrl: 'https://rpc.eblanetwork.com/',
    iconUrl: '/logo192.png',
    blockExplorerUrl: 'https://explorer.eblanetwork.com/',
    nativeCurrency: {
      name: 'EBLA',
      symbol: 'EBLA',
      decimals: 18,
    },
    indexerUrl: 'https://indexer.mainnet.explorer.eblanetwork.com',
  },
  60187: {
    chainName: 'EBLA Testnet',
    rpcUrl: 'https://rpc.testnet.eblanetwork.com/',
    iconUrl: '/logo192.png',
    blockExplorerUrl: 'https://explorer.testnet.eblanetwork.com/',
    nativeCurrency: {
      name: 'EBLA',
      symbol: 'EBLA',
      decimals: 18,
    },
    indexerUrl: 'https://api.explorer.testnet.eblanetwork.com',
  },
  60188: {
    chainName: 'EBLA Devnet',
    rpcUrl: 'https://devnet-rpc.eblanetwork.com/',
    iconUrl: '/logo192.png',
    blockExplorerUrl: 'https://devnet.explorer.eblanetwork.com/',
    nativeCurrency: {
      name: 'EBLA',
      symbol: 'EBLA',
      decimals: 18,
    },
    indexerUrl: 'https://indexer.devnet.explorer.eblanetwork.com',
  },
  200: {
    chainName: 'EBLA PRnet',
    rpcUrl: 'https://rpc-pr-2460.prnet.eblanetwork.com/',
    iconUrl: '/logo192.png',
    blockExplorerUrl: 'https://explorer-pr-2460.prnet.eblanetwork.com/',
    nativeCurrency: {
      name: 'EBLA',
      symbol: 'EBLA',
      decimals: 18,
    },
    indexerUrl: 'https://indexer-pr-2460.prnet.eblanetwork.com',
  },
};
