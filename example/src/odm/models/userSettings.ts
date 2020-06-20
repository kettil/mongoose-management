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

import { userSettingsDefinitions, userSettingsIndexes } from '../documents/userSettings';
import { InterfaceUserSettingsDocument, InterfaceUserSettingsModel } from '../interfaces/userSettings';
import { methods, options, queries, statics, virtuals } from '../repositories/userSettings';

import { addIndexes, addVirtualProperties, checkDuplicateKeys } from '../helper';

// If a key was found several times, then an error is thrown.
checkDuplicateKeys('userSettings', [Schema.prototype, userSettingsDefinitions, methods, statics, queries, virtuals]);

// Create model schema
export const userSettingsSchema = new Schema(userSettingsDefinitions, options);

userSettingsSchema.methods = { ...methods, ...userSettingsSchema.methods };
userSettingsSchema.statics = { ...statics, ...userSettingsSchema.statics };
userSettingsSchema.query = { ...queries, ...userSettingsSchema.query };
addVirtualProperties(userSettingsSchema, virtuals);
addIndexes(userSettingsSchema, userSettingsIndexes);

/**
 * For the multiple database connections
 *
 * @param conn
 */
const connectUserSettingsModel = (conn: Connection) => {
  return conn.model<InterfaceUserSettingsDocument, InterfaceUserSettingsModel>('UserSettings', userSettingsSchema);
};

export default connectUserSettingsModel;
