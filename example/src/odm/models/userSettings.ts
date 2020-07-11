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
import { userSettingsDefinitions, userSettingsIndexes } from '../documents/userSettings';
import { addIndexes, addVirtualProperties, checkDuplicateKeys } from '../helper';
import { UserSettingsDocument, UserSettingsModel } from '../types/userSettings';
import middlewareUserSettings from '../middlewares/userSettings';
import { methods, options, queries, statics, virtuals } from '../repositories/userSettings';

// If a key was found several times, then an error is thrown.
checkDuplicateKeys('userSettings', [Schema.prototype, userSettingsDefinitions, methods, statics, queries, virtuals]);

// Create model schema
const schema = new Schema(userSettingsDefinitions, options);

schema.methods = { ...methods, ...schema.methods };
schema.statics = { ...statics, ...schema.statics };
schema.query = { ...queries, ...schema.query };

middlewareUserSettings(schema.pre.bind(schema), schema.post.bind(schema));

addVirtualProperties(schema, virtuals);
addIndexes(schema, userSettingsIndexes);

/**
 * For the multiple database connections
 */
const connectUserSettings = (conn: Connection): UserSettingsModel =>
  conn.model<UserSettingsDocument, UserSettingsModel>('UserSettings', schema);

export default connectUserSettings;
