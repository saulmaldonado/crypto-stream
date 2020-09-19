/* eslint-disable no-console */
/* eslint-disable no-plusplus */
/* eslint-disable indent */
/* eslint-disable no-bitwise */
/* eslint-disable no-unused-vars */
import mongoose, { ConnectionOptions } from 'mongoose';

/**
 * Wraps an asynchronous functions and displays a
 * twirling timer animation in the console while pending.
 * @param {Function} func
 */
const asyncLoadingWrapper = <A extends any[] | [any]>(
  func: (...args: any) => Promise<any>
) => async (...args: A) => {
  const twirlTimer = (() => {
    const P = ['\\', '|', '/', '-'];
    let x = 0;
    return setInterval(() => {
      process.stdout.write(`\r${P[x++]}`);
      x &= 3;
    }, 250);
  })();
  await func(...args);
  clearInterval(twirlTimer);
};

/**
 * Wraps mongoose connect method in an async function and executes using provided uri
 * and ConnectionOptions.
 * @param {string} [uri='mongodb://localhost:27017']
 * @param {ConnectionOptions} options
 */
export const connect = async (
  options: ConnectionOptions,
  db: string = '',
  uri: string = 'mongodb://localhost:27017'
): Promise<void | never> => {
  try {
    const wrappedConnect = asyncLoadingWrapper<[uri: string, options: ConnectionOptions]>(
      mongoose.connect
    );

    console.log('connecting to MongoDB...');

    await wrappedConnect(`${uri}/${db}`, options);

    console.log('Database Successfully connected!');
  } catch (err) {
    console.log('There was an error connecting to the database.');
    console.error(err);
    process.exit(1);
  }
};
