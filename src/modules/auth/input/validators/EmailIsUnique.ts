import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

import { UsersModel } from '../../../../models/Users';

@ValidatorConstraint({ async: true })
export class EmailIsUniqueConstraint implements ValidatorConstraintInterface {
  async validate(email: string) {
    const user = await UsersModel.findOne({ email });
    return !user;
  }
}

export function EmailIsUnique(validationOptions?: Omit<ValidationOptions, 'message'>) {
  const options: ValidationOptions = { ...validationOptions, message: 'Email already exists' };
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options,
      constraints: [],
      validator: EmailIsUniqueConstraint,
    });
  };
}
