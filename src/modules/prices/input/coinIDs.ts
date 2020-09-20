import { ArrayMaxSize, ArrayMinSize } from 'class-validator';
import { Field, InputType } from 'type-graphql';

import { IsCoinID } from './validators/IsCoinID';

@InputType()
export class getPriceInput {
  @Field(() => [String])
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  @IsCoinID()
  coinIDs!: string[];
}
