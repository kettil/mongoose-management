/* eslint-disable @typescript-eslint/naming-convention */
/*
 * ######################################################################
 * #                                                                    #
 * #                       Do not change the file!                      #
 * #                                                                    #
 * # All changes are deleted the next time the collection data is read. #
 * #                                                                    #
 * ######################################################################
 */

import { Connection, Schema } from 'mongoose';
import { usersDefinitions, usersIndexes } from '../documents/users';
import { addIndexes, addVirtualProperties, checkDuplicateKeys } from '../helper';
import { UsersDocument, UsersModel } from '../types/users';
import middlewareUsers from '../middlewares/users';
import { methods, options, queries, statics, virtuals } from '../repositories/users';

// If a key was found several times, then an error is thrown.
checkDuplicateKeys('users', [Schema.prototype, usersDefinitions, methods, statics, queries, virtuals]);

// Create model schema
const schema = new Schema(usersDefinitions, options);

schema.methods = { ...methods, ...schema.methods };
schema.statics = { ...statics, ...schema.statics };
schema.query = { ...queries, ...schema.query };

middlewareUsers(schema.pre.bind(schema), schema.post.bind(schema));

addVirtualProperties(schema, virtuals);
addIndexes(schema, usersIndexes);

/**
 * For the multiple database connections
 */
const connectUsers = (conn: Connection): UsersModel => conn.model<UsersDocument, UsersModel>('Users', schema);

export default connectUsers;
