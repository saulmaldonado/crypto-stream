import { Resolver, Mutation, Arg, Query, Authorized, Ctx } from 'type-graphql';

import { Transaction } from '../../schemas/Transaction';
import { getTokenUserID } from '../auth/jwt/getTokenUserID';
import { isManagement } from '../auth/jwt/isManagement';
import { Context } from '../auth/middleware/Context';
import { addNewTrade } from './controllers/addTrade';
import { addNewTransaction } from './controllers/addTransaction';
import { getTransactionById } from './controllers/getTransaction';
import { AddTransactionInput } from './input/AddTransactionInput';

@Resolver()
export class TransactionResolver {
  /**
   * Get transaction by ID. If no userID is provided controller is protected to admin role
   * @param transactionID
   * @param userID
   */
  @Authorized()
  @Query(() => Transaction)
  async getTransaction(
    @Arg('transactionID') transactionID: string,
    @Ctx() ctx: Context,
    @Arg('userID', { nullable: true }) userID?: string
  ): Promise<Transaction | never> {
    if (userID) {
      isManagement(ctx);
    } else {
      userID = getTokenUserID(ctx);
    }

    return getTransactionById(transactionID, userID);
  }

  @Authorized()
  @Mutation(() => Transaction)
  async addTrade(@Arg('data') data: AddTransactionInput): Promise<any | never> {
    await addNewTrade(data);
    return addNewTransaction(data);
  }
}
