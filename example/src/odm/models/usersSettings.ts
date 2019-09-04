/**
 * ######################################################################
 * #                                                                    #
 * #                       Do not change the file!                      #
 * #                                                                    #
 * # All changes are deleted the next time the collection data is read. #
 * #                                                                    #
 * ######################################################################
 */

import mongoose, { Connection, Schema } from 'mongoose';

import { usersSettingsDefinitions, usersSettingsIndexes } from '../documents/usersSettings';
import { InterfaceUsersSettingsDocument, InterfaceUsersSettingsModel } from '../interfaces/usersSettings';
import { methods, options, queries, statics, virtuals } from '../repositories/usersSettings';

import { addIndexes, addVirtualProperties, checkDuplicateKeys } from '../helper';

// If a key was found several times, then an error is thrown.
checkDuplicateKeys('usersSettings', [Schema.prototype, usersSettingsDefinitions, methods, statics, queries, virtuals]);

// Create model schema
export const usersSettingsSchema = new Schema(usersSettingsDefinitions, options);

usersSettingsSchema.methods = { ...methods, ...usersSettingsSchema.methods };
usersSettingsSchema.statics = { ...statics, ...usersSettingsSchema.statics };
usersSettingsSchema.query = { ...queries, ...usersSettingsSchema.query };
addVirtualProperties(usersSettingsSchema, virtuals);
addIndexes(usersSettingsSchema, usersSettingsIndexes);

/**
 * For multiple database connections
 *
 * @param handler
 * @param collection
 */
export const createUsersSettingsModel = (handler: Connection) => {
  return handler.model<InterfaceUsersSettingsDocument, InterfaceUsersSettingsModel>(
    'UsersSettings',
    usersSettingsSchema,
  );
};

/**
 * Create default model with default connection
 */
const Model = mongoose.model<InterfaceUsersSettingsDocument, InterfaceUsersSettingsModel>(
  'UsersSettings',
  usersSettingsSchema,
);

export default Model;
