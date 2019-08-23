#!/usr/bin/env node
import yargs from 'yargs';

import app from './lib/app';

(async () => {
  try {
    const argv = yargs
      .usage('$0 [-p path/to/project] [-d schemas.json]', 'Mongoose schemas management tool')
      .group(['p', 'd'], 'Config:')
      .options({
        p: {
          type: 'string',
          alias: 'path',
          description: 'Path to the project folder',
          hidden: false,
        },
        d: {
          type: 'string',
          alias: 'data',
          description: 'File name where the schema data is stored\n(file is saved in project folder)',
        },
      })
      .help(true)
      .version(true)
      .parse();

    await app(argv);
  } catch (err) {
    // tslint:disable-next-line
    console.error(err);
  }
})();
