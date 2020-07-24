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
import { logsDefinitions, logsIndexes } from '../documents/logs';
import { addIndexes, addVirtualProperties, checkDuplicateKeys } from '../helper';
import { LogsDocument, LogsModel } from '../types/logs';
import addLogsHooks from '../hooks/logs';
import { methods, options, queries, statics, virtuals } from '../repositories/logs';

// If a key was found several times, then an error is thrown.
checkDuplicateKeys('logs', [Schema.prototype, logsDefinitions, methods, statics, queries, virtuals]);

// Create model schema
const schema = new Schema<typeof methods>(logsDefinitions, options);

schema.methods = { ...methods, ...schema.methods };
schema.statics = { ...statics, ...schema.statics };
schema.query = { ...queries, ...schema.query };

addLogsHooks(schema.pre.bind(schema), schema.post.bind(schema));

addVirtualProperties(schema, virtuals);
addIndexes(schema, logsIndexes);

/**
 * For the multiple database connections
 */
const connectLogs = (conn: Connection): LogsModel => conn.model<LogsDocument, LogsModel>('Logs', schema);

export default connectLogs;
