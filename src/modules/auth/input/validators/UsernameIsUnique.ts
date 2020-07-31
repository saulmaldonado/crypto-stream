import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

import { UsersModel } from '../../../../models/Users';

@ValidatorConstraint({ async: true })
export class UsernameUniqueConstraint implements ValidatorConstraintInterface {
  async validate(username: string) {
    const user = await UsersModel.findOne({ username });
    return !user;
  }
}

export function UsernameIsUnique(validationOptions?: Omit<ValidationOptions, 'message'>) {
  const message = 'Username already exists';

  const options: ValidationOptions = { ...validationOptions, message };
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options,
      constraints: [],
      validator: UsernameUniqueConstraint,
    });
  };
}
