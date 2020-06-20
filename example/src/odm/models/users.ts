/**
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
import { InterfaceUsersDocument, InterfaceUsersModel } from '../interfaces/users';
import { methods, options, queries, statics, virtuals } from '../repositories/users';

import { addIndexes, addVirtualProperties, checkDuplicateKeys } from '../helper';

// If a key was found several times, then an error is thrown.
checkDuplicateKeys('users', [Schema.prototype, usersDefinitions, methods, statics, queries, virtuals]);

// Create model schema
export const usersSchema = new Schema(usersDefinitions, options);

usersSchema.methods = { ...methods, ...usersSchema.methods };
usersSchema.statics = { ...statics, ...usersSchema.statics };
usersSchema.query = { ...queries, ...usersSchema.query };
addVirtualProperties(usersSchema, virtuals);
addIndexes(usersSchema, usersIndexes);

/**
 * For the multiple database connections
 *
 * @param conn
 */
const connectUsersModel = (conn: Connection) => {
  return conn.model<InterfaceUsersDocument, InterfaceUsersModel>('Users', usersSchema);
};

export default connectUsersModel;
