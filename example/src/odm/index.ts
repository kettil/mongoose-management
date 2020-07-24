/* eslint-disable @typescript-eslint/naming-convention, import/no-unused-modules */
/*
 * ######################################################################
 * #                                                                    #
 * #                       Do not change the file!                      #
 * #                                                                    #
 * # All changes are deleted the next time the collection data is read. #
 * #                                                                    #
 * ######################################################################
 */

import { Connection } from 'mongoose';
import connectLogs from './models/logs';
import connectPages from './models/pages';
import connectUserSettings from './models/userSettings';
import connectUsers from './models/users';

export * from './types/logs';
export * from './types/pages';
export * from './types/userSettings';
export * from './types/users';

/**
 * For the multiple database connections
 */
const connectionFactory = (conn: Connection) =>
  ({
    Logs: connectLogs(conn),
    Pages: connectPages(conn),
    UserSettings: connectUserSettings(conn),
    Users: connectUsers(conn),
  } as const);

export default connectionFactory;
