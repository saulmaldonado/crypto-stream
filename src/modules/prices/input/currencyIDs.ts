import { ArrayMaxSize, ArrayMinSize } from 'class-validator';
import { Field, InputType } from 'type-graphql';

import { IsCoinID } from './validators/IsCoinID';
import metadata from '../prices.metadata.json';

@InputType('CurrencyIDInput')
export class CurrencyIDInput {
  @Field(() => [String], { nullable: true, description: metadata.CurrencyID.description })
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  @IsCoinID()
  coinIDs!: string[];
}
