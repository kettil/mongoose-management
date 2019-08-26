#!/usr/bin/env node
import app from './lib/app';

(async () => {
  try {
    await app();
  } catch (err) /* istanbul ignore next */ {
    // tslint:disable-next-line
    console.error(err);
    process.exit(1);
  }
})();
