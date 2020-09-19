import {
  isEmail,
  maxLength,
  minLength,
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint()
export class UsernameOrEmailConstraint implements ValidatorConstraintInterface {
  async validate(usernameOrEmail: string) {
    return (
      isEmail(usernameOrEmail) || (minLength(usernameOrEmail, 8) && maxLength(usernameOrEmail, 50))
    );
  }
}

export function IsUsernameOrEmail(validationOptions?: Omit<ValidationOptions, 'message'>) {
  const message = 'Username or email is not valid';

  const options: ValidationOptions = { ...validationOptions, message };
  return (object: Object, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options,
      constraints: [],
      validator: UsernameOrEmailConstraint,
    });
  };
}
