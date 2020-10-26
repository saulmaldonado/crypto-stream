import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationOptions,
  registerDecorator,
} from 'class-validator';
import Redis from 'ioredis';
import { redis } from '../../../../utils/redisCache';

@ValidatorConstraint()
export class CoinIDConstraint implements ValidatorConstraintInterface {
  async validate(coinIDs: string[]) {
    return coinIDs.every(async (coin, i, arr) => {
      // * mutates the original string
      arr[i] = arr[i].toUpperCase();
      coin = arr[i];

      const res: Redis.BooleanResponse = await redis.sismember('COINIDS', coin);
      return !!res;
    });
  }
}

export function IsCoinID(validationOptions?: Omit<ValidationOptions, 'message'>) {
  const message = 'One or more invalid coinIDs have been requested';

  const options: ValidationOptions = { ...validationOptions, message };
  return (object: Object, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options,
      constraints: [],
      validator: CoinIDConstraint,
    });
  };
}
