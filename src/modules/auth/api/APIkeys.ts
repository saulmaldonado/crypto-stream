import { randomBytes } from 'crypto';

export const generateAPIKey = () => {
  return randomBytes(16).toString('hex');
};
