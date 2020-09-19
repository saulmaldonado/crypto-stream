import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint()
export class IsBuyOrSellConstraint implements ValidatorConstraintInterface {
  async validate(buyOrSell: string) {
    const buyOrSellTransformed = buyOrSell.toLowerCase().trim();
    return buyOrSellTransformed === 'buy' || buyOrSellTransformed === 'sell';
  }
}

export function IsBuyOrSell(validationOptions?: Omit<ValidationOptions, 'message'>) {
  const message = 'Trade type must be "buy" or "sell"';

  const options: ValidationOptions = { ...validationOptions, message };
  return (object: Object, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options,
      constraints: [],
      validator: IsBuyOrSellConstraint,
    });
  };
}
