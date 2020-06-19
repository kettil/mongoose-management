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

import { tDefinitions, tIndexes } from '../documents/t';
import { InterfaceTDocument, InterfaceTModel } from '../interfaces/t';
import { methods, options, queries, statics, virtuals } from '../repositories/t';

import { addIndexes, addVirtualProperties, checkDuplicateKeys } from '../helper';

// If a key was found several times, then an error is thrown.
checkDuplicateKeys('t', [Schema.prototype, tDefinitions, methods, statics, queries, virtuals]);

// Create model schema
export const tSchema = new Schema(tDefinitions, options);

tSchema.methods = { ...methods, ...tSchema.methods };
tSchema.statics = { ...statics, ...tSchema.statics };
tSchema.query = { ...queries, ...tSchema.query };
addVirtualProperties(tSchema, virtuals);
addIndexes(tSchema, tIndexes);

/**
 * For multiple database connections
 *
 * @param handler
 * @param collection
 */
export const createTModel = (handler: Connection) => {
  return handler.model<InterfaceTDocument, InterfaceTModel>('T', tSchema);
};

/**
 * Create default model with default connection
 */
const Model = model<InterfaceTDocument, InterfaceTModel>('T', tSchema);

export default Model;
