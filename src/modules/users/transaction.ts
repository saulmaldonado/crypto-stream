import { Resolver, Mutation, Arg, Query } from 'type-graphql';

import { Transaction } from '../../schemas/Transaction';
import { addNewTransaction } from './controllers/addTransaction';
import { AddTransactionInput } from './input/AddTransactionInput';

@Resolver()
export class TransactionResolver {
  @Mutation(() => Transaction)
  async addTrade(@Arg('data') data: AddTransactionInput): Promise<Transaction | never> {
    return await addNewTransaction(data);
  }
}
