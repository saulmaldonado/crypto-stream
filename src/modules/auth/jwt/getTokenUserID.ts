import { decode } from 'jsonwebtoken';
import { Context } from '../middleware/Context';

import { JWTPayload } from '../middleware/authChecker';

export const getTokenUserID = ({ token }: Context): string => {
  const { sub } = decode(token!) as JWTPayload;

  return sub!;
};
