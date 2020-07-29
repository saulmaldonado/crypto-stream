import mongoose, { ConnectionOptions } from 'mongoose';
import { promises } from 'fs';

/**
 * opens mongoose connection. Logs on console and attempts reconnect on disconnect.
 * @param {string} uri
 * @param {ConnectionOptions} options
 */
export const connect = async (
  uri: string | undefined,
  options: ConnectionOptions
): Promise<void | never> => {
  if (!uri) throw new Error('Connection string not provided');

  const uriAbridged = uri.match(/@(.+mongodb\.net.+)\?/i);
  if (!uriAbridged) throw new Error('invalid connection string');
  const [, address] = uriAbridged;

  const log = () => console.log(`connecting to ${address}...`);

  log();
  try {
    const connect = asyncLoadingWrapper<[uri: string, options: ConnectionOptions]>(mongoose.connect);

    await connect(uri, options);

    // await mongoose.connect(uri, options);
    console.log('Database Successfully connected!');
  } catch (err) {
    console.log('There was an error connecting to the database.');
    console.error(err);
    process.exit(1);
  }
};

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
