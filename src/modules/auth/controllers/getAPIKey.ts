import { getTokenUserID } from '../jwt/getTokenUserID';
import { Context } from '../middleware/Context';

const getAPIKey = (ctx: Context) => {
  const userID = getTokenUserID(ctx);
};
