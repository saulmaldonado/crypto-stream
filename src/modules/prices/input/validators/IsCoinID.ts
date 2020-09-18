import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationOptions,
  registerDecorator,
} from 'class-validator';
import { allCoinIDs } from '../../../../config/coinIDs';

@ValidatorConstraint()
export class CoinIDConstraint implements ValidatorConstraintInterface {
  async validate(coinIDs: string[]) {
    return coinIDs.every((coin) => allCoinIDs.includes(coin.toUpperCase()));
  }
}

export function IsCoinID(validationOptions?: Omit<ValidationOptions, 'message'>) {
  const message = 'One or more invalid coinIDs have been requested';

  const options: ValidationOptions = { ...validationOptions, message };
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options,
      constraints: [],
      validator: CoinIDConstraint,
    });
  };
}
