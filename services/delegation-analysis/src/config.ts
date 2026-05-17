import { config } from 'dotenv';

config();

export const databaseConfig = {
  delegationHost: `${process.env.DELEGATION_HOST}`,
  delegationPort: Number(`${process.env.DELEGATION_PORT}`),
  delegationUser: `${process.env.DELEGATION_USER}`,
  delegationPassword: `${process.env.DELEGATION_PASS}`,
  delegationDatabase: `${process.env.DELEGATION_DB}`,
  eblaProdHost: `${process.env.USERDATA_HOST}`,
  eblaProdPort: Number(`${process.env.USERDATA_PORT}`),
  eblaProdUser: `${process.env.USERDATA_USER}`,
  eblaProdPassword: `${process.env.USERDATA_PASS}`,
  eblaProdDatabase: `${process.env.USERDATA_DB}`,
};

export const runtimeConfig = {
  outputDir: `${process.env.GENERATED_DEST_FOLDER}`,
  stakingSubgraphURL: `${process.env.GRAPHQL_STAKING_URL}`,
};
