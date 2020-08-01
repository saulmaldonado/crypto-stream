import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint()
export class IsBuyOrSellConstraint implements ValidatorConstraintInterface {
  async validate(buyOrSell: string) {
    buyOrSell = buyOrSell.toLowerCase().trim();
    return buyOrSell === 'buy' || buyOrSell === 'sell';
  }
}

export function IsBuyOrSell(validationOptions?: Omit<ValidationOptions, 'message'>) {
  const message = 'Trade type must be "buy" or "sell"';

  const options: ValidationOptions = { ...validationOptions, message };
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options,
      constraints: [],
      validator: IsBuyOrSellConstraint,
    });
  };
}
