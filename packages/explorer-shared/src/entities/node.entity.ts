import { ViewEntity, ViewColumn } from 'typeorm';
import { IEblaNode } from '../models';

@ViewEntity({
  expression: `
      SELECT "miner" AS "address", COUNT("hash") AS "pbftCount" FROM "pbfts" GROUP BY "miner"
  `,
})
export class NodeEntity implements IEblaNode {
  @ViewColumn()
  address: string;

  @ViewColumn()
  pbftCount: number;
}
