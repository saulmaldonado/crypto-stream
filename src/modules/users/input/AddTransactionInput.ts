import { InputType, Field } from 'type-graphql';

import { IsBuyOrSell } from './validators/IsBuyOrSell';

@InputType('AddTransactionInput')
export class AddTransactionInput {
  @Field()
  portfolioID!: string;

  @Field()
  coinID!: string;

  @Field()
  @IsBuyOrSell()
  buyOrSell!: 'buy' | 'sell';

  @Field()
  coinName!: string;

  @Field()
  coinSymbol!: string;

  @Field()
  quantity!: number;
}
