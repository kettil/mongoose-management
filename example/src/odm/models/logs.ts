/**
 * ######################################################################
 * #                                                                    #
 * #                       Do not change the file!                      #
 * #                                                                    #
 * # All changes are deleted the next time the collection data is read. #
 * #                                                                    #
 * ######################################################################
 */

import { Connection, model, Schema } from 'mongoose';

import { logsDefinitions, logsIndexes } from '../documents/logs';
import { InterfaceLogsDocument, InterfaceLogsModel } from '../interfaces/logs';
import { methods, options, queries, statics, virtuals } from '../repositories/logs';

import { addIndexes, addVirtualProperties, checkDuplicateKeys } from '../helper';

// If a key was found several times, then an error is thrown.
checkDuplicateKeys('logs', [Schema.prototype, logsDefinitions, methods, statics, queries, virtuals]);

// Create model schema
export const logsSchema = new Schema(logsDefinitions, options);

logsSchema.methods = { ...methods, ...logsSchema.methods };
logsSchema.statics = { ...statics, ...logsSchema.statics };
logsSchema.query = { ...queries, ...logsSchema.query };
addVirtualProperties(logsSchema, virtuals);
addIndexes(logsSchema, logsIndexes);

/**
 * For multiple database connections
 *
 * @param handler
 * @param collection
 */
export const createLogsModel = (handler: Connection) => {
  return handler.model<InterfaceLogsDocument, InterfaceLogsModel>('Logs', logsSchema);
};

/**
 * Create default model with default connection
 */
const Model = model<InterfaceLogsDocument, InterfaceLogsModel>('Logs', logsSchema);

export default Model;
