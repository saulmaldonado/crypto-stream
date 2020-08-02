import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

import { UsersAuthModel } from '../../../../models/Portfolio';

@ValidatorConstraint({ async: true })
export class UsernameOrEmailExistsConstraint implements ValidatorConstraintInterface {
  async validate(usernameOrEmail: string) {
    let user = await UsersAuthModel.findOne({
      $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
    });
    if (user) return true;
    return false;
  }
}

export function UsernameOrEmailExists(validationOptions?: Omit<ValidationOptions, 'message'>) {
  const message = 'Username or email does not exist';

  const options: ValidationOptions = { ...validationOptions, message };
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options,
      constraints: [],
      validator: UsernameOrEmailExistsConstraint,
    });
  };
}
