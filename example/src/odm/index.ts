/**
 * ######################################################################
 * #                                                                    #
 * #                       Do not change the file!                      #
 * #                                                                    #
 * # All changes are deleted the next time the collection data is read. #
 * #                                                                    #
 * ######################################################################
 */

import { Connection } from 'mongoose';

/**
 * Import the Models
 */
import Logs, { createLogsModel } from './models/logs';
import Pages, { createPagesModel } from './models/pages';
import UserSettings, { createUserSettingsModel } from './models/userSettings';
import Users, { createUsersModel } from './models/users';

/**
 * TypeScript Namespace
 */
export * from './interfaces/logs';
export * from './interfaces/pages';
export * from './interfaces/userSettings';
export * from './interfaces/users';

/**
 * Create a object with models and these has a custom connection handler
 *
 * @param handler
 */
export const getModels = (handler: Connection) => {
  return {
    Logs: createLogsModel(handler),
    Pages: createPagesModel(handler),
    UserSettings: createUserSettingsModel(handler),
    Users: createUsersModel(handler),
  };
};

/**
 * Models with default connection handler
 */
export const LogsModel = Logs;
export const PagesModel = Pages;
export const UserSettingsModel = UserSettings;
export const UsersModel = Users;

/**
 * Object with all models
 */
export const models = {
  Logs,
  Pages,
  UserSettings,
  Users,
};

export default models;
