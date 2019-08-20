#!/usr/bin/env node
import app from './lib/app';

(async () => {
  try {
    await app();
  } catch (err) {
    // tslint:disable-next-line
    console.error(err);
  }
})();
