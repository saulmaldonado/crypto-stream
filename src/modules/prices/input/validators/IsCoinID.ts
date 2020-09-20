import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationOptions,
  registerDecorator,
} from 'class-validator';
import { allCoinIDs } from '../../../../config/coinIDsConfig';

@ValidatorConstraint()
export class CoinIDConstraint implements ValidatorConstraintInterface {
  async validate(coinIDs: string[]) {
    return coinIDs.every((coin, i, arr) => {
      // * mutates the original string
      coin = arr[i] = arr[i].toUpperCase();
      return allCoinIDs.includes(coin);
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
