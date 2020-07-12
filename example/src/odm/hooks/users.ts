/* eslint-disable func-names */
/*
 * ######################################################################
 * #                                                                    #
 * #                      This file can be edited.                      #
 * #                                                                    #
 * #              The file is only created if none exists.              #
 * #                                                                    #
 * ######################################################################
 *
 * @see https://mongoosejs.com/docs/middleware.html
 */

import { UsersHooks } from '../types/users';

/* eslint-disable-next-line @typescript-eslint/ban-types */
type ExtendQuery = {};

/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
const addUsersHooks: UsersHooks<ExtendQuery> = (pre, post) => {
  /*
  pre('save', function() {
    if (this.isModified('password')) {
      this.password = hash(this.password);
    }
  });

  pre('find', async function() {
    console.log('users:find:query', this.getQuery());

    // type ExtendQuery = { start: number };
    this.start = Date.now();
  });

  post('find', async function(docs) {
    const start = this.start;
    if (start) {
      console.log('users:find:run', (Date.now() - start) + 'ms');
    }
  });
  // */
};

export default addUsersHooks;
