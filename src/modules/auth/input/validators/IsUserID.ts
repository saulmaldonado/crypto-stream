import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint()
export class IsUserIDConstraint implements ValidatorConstraintInterface {
  async validate(userID: string) {
    return userID.startsWith('auth0|') || userID.startsWith('google-oauth2|');
  }
}

export function IsUserID(validationOptions?: Omit<ValidationOptions, 'message'>) {
  const message = 'UserID is invalid';

  const options: ValidationOptions = { ...validationOptions, message };
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options,
      constraints: [],
      validator: IsUserIDConstraint,
    });
  };
}
