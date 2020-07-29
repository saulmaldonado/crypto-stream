import { Document, model, Model } from 'mongoose';
import { UserSchema } from '../schemas/Users';

interface IUser extends Document {
  username: string;
  password: string;
  email: string;
}

const UsersModel: Model<IUser> = model<IUser>('User', UserSchema);

export const createUser = async (
  user: Pick<IUser, 'username' | 'password' | 'email'>
): Promise<void> => {
  await UsersModel.create(user);
};
