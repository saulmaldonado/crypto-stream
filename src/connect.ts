import mongoose, { ConnectionOptions } from 'mongoose';

/**
 * Wraps mongoose connect method in an async function and executes using provided uri
 * and ConnectionOptions.
 * @param {string} [uri='mongodb://localhost:27017/']
 * @param {ConnectionOptions} options
 */
export const connect = async (
  options: ConnectionOptions,
  db: string = '',
  uri: string = 'mongodb://localhost:27017'
): Promise<void | never> => {
  try {
    const connect = asyncLoadingWrapper<[uri: string, options: ConnectionOptions]>(
      mongoose.connect
    );

    console.log('connecting to MongoDB...');

    await connect(`${uri}/${db}`, options);

    console.log('Database Successfully connected!');
  } catch (err) {
    console.log('There was an error connecting to the database.');
    console.error(err);
    process.exit(1);
  }
};

/**
 * Wraps an asynchronous functions and displays a twirling timer animation in the console while pending.
 * @param {Function} func
 */
const asyncLoadingWrapper = <A extends any[] | [any]>(func: (...args: any) => Promise<any>) => {
  return async (...args: A) => {
    const twirlTimer = (() => {
      const P = ['\\', '|', '/', '-'];
      let x = 0;
      return setInterval(function () {
        process.stdout.write('\r' + P[x++]);
        x &= 3;
      }, 250);
    })();
    await func(...args);
    clearInterval(twirlTimer);
  };
};
