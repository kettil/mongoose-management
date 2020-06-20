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
import connectLogsModel from './models/logs';
import connectPagesModel from './models/pages';
import connectUserSettingsModel from './models/userSettings';
import connectUsersModel from './models/users';

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
 * @param conn
 */
export const connectionFactory = (conn: Connection) => {
  return {
    Logs: connectLogsModel(conn),
    Pages: connectPagesModel(conn),
    UserSettings: connectUserSettingsModel(conn),
    Users: connectUsersModel(conn),
  };
};

export default connectionFactory;
