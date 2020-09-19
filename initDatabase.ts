import { MongoClient } from 'mongodb';
import { config } from 'dotenv';
import { exit, stdin, stdout } from 'process';
import { createInterface } from 'readline';

import { CollectionNames } from './src/config/DbConfig';

config();

const reset: boolean = process.argv.includes('--reset');

const uri: string | undefined = process.env.CONNECTION_STRING;
if (!uri) throw new Error('Connection string not provided.');

const client = new MongoClient(uri, { useUnifiedTopology: true });

(async () => {
  try {
    const conn = await client.connect();
    if (reset) {
      await new Promise<void>((res, rej) => {
        const r1 = createInterface({
          input: stdin,
          output: stdout,
        });
        try {
          r1.question(
            'Are you sure you want to reset your cryptoTracker database? [Y/n]: ',
            async (answer) => {
              if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
                await conn.db('cryptoTracker').dropDatabase();
                console.log('cryptoTracker Database dropped');
                r1.close();
                res();
              } else {
                r1.close();
                exit(0);
              }
            }
          );
        } catch {
          r1.close();
          rej();
        }
      });
    }

    await conn.db('cryptoTracker').createCollection(CollectionNames.PORTFOLIOS);
    await conn.db('cryptoTracker').createCollection(CollectionNames.API_KEYS);

    console.log('Database initialized');
    exit(0);
  } catch {
    exit(1);
  }
})();
