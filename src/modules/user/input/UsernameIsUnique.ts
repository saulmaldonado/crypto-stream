import { getModelForClass } from '@typegoose/typegoose';
import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { User } from '../../../schemas/Users';

@ValidatorConstraint({ async: true })
export class UsernameUniqueConstraint implements ValidatorConstraintInterface {
  async validate(username: string) {
    const UsersModel = getModelForClass(User, {
      schemaOptions: { collection: 'auth' },
    });

    const user = await UsersModel.findOne({ username });
    return !user;
  }
}

export function UsernameIsUnique(validationOptions?: Omit<ValidationOptions, 'message'>) {
  const options: ValidationOptions = { ...validationOptions, message: 'Username already exists' };
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
