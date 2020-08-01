import { Resolver, Mutation, Arg, Query } from 'type-graphql';

import { Transaction } from '../../schemas/Transaction';
import { addNewTrade } from './controllers/addTrade';
import { addNewTransaction } from './controllers/addTransaction';
import { getTransactionById } from './controllers/getTransacation';
import { AddTransactionInput } from './input/AddTransactionInput';

@Resolver()
export class TransactionResolver {
  /**
   * Get transaction by ID. If no userID is provided controller is protected to admin role
   * @param transactionID
   * @param userID
   */
  @Query(() => Transaction)
  async getTransaction(
    @Arg('transactionID') transactionID: string,
    @Arg('userID', { nullable: true }) userID?: string
  ): Promise<Transaction | never> {
    return await getTransactionById(transactionID, userID);
  }

  @Mutation(() => Transaction)
  async addTrade(@Arg('data') data: AddTransactionInput): Promise<any | never> {
    await addNewTrade(data);
    return await addNewTransaction(data);
  }
}
