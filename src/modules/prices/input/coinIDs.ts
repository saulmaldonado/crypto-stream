import { ArrayMaxSize } from 'class-validator';
import { Field, InputType } from 'type-graphql';

import { IsCoinID } from '../input/validators/IsCoinID';

@InputType()
export class getPriceInput {
  @Field(() => [String])
  @ArrayMaxSize(100)
  @IsCoinID()
  coinIDs!: string[];
}
