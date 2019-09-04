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
import Users, { createUsersModel } from './models/users';
import UsersSettings, { createUsersSettingsModel } from './models/usersSettings';

/**
 * TypeScript Namespace
 */
export * from './interfaces/logs';
export * from './interfaces/pages';
export * from './interfaces/users';
export * from './interfaces/usersSettings';

/**
 * Create a object with models and these has a custom connection handler
 *
 * @param handler
 */
export const getModels = (handler: Connection) => {
  return {
    Logs: createLogsModel(handler),
    Pages: createPagesModel(handler),
    Users: createUsersModel(handler),
    UsersSettings: createUsersSettingsModel(handler),
  };
};

/**
 * Models with default connection handler
 */
export const LogsModel = Logs;
export const PagesModel = Pages;
export const UsersModel = Users;
export const UsersSettingsModel = UsersSettings;

/**
 * Object with all models
 */
export const models = {
  Logs,
  Pages,
  Users,
  UsersSettings,
};

export default models;
