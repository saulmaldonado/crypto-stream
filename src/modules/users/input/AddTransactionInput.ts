import { InputType, Field } from 'type-graphql';

import { IsUserID } from '../../auth/input/validators/IsUserID';
import { IsBuyOrSell } from './validators/IsBuyOrSell';

@InputType()
export class AddTransactionInput {
  @Field()
  @IsUserID()
  userID!: string;

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
