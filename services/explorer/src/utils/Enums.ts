export enum HashLinkType {
  TRANSACTIONS = 'tx',
  BLOCKS = 'block',
  PBFT = 'pbft',
  ADDRESSES = 'address',
}

export const SELECTED_NETWORK = 'SELECTED_NETWORK';

export enum Network {
  MAINNET = 'Mainnet',
  TESTNET = 'Testnet',
  DEVNET = 'Devnet',
}

export enum NetworkGraphQLEndpoints {
  MAINNET = 'https://graphql.mainnet.eblanetwork.com/',
  TESTNET = 'https://graphql.testnet.eblanetwork.com/',
  DEVNET = 'https://graphql.devnet.eblanetwork.com/',
}
