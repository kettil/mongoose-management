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

import { pagesDefinitions, pagesIndexes } from '../documents/pages';
import { InterfacePagesDocument, InterfacePagesModel } from '../interfaces/pages';
import { methods, options, queries, statics, virtuals } from '../repositories/pages';

import { addIndexes, addVirtualProperties, checkDuplicateKeys } from '../helper';

// If a key was found several times, then an error is thrown.
checkDuplicateKeys('pages', [Schema.prototype, pagesDefinitions, methods, statics, queries, virtuals]);

// Create model schema
export const pagesSchema = new Schema(pagesDefinitions, options);

pagesSchema.methods = { ...methods, ...pagesSchema.methods };
pagesSchema.statics = { ...statics, ...pagesSchema.statics };
pagesSchema.query = { ...queries, ...pagesSchema.query };
addVirtualProperties(pagesSchema, virtuals);
addIndexes(pagesSchema, pagesIndexes);

/**
 * For the multiple database connections
 *
 * @param conn
 */
const connectPagesModel = (conn: Connection) => {
  return conn.model<InterfacePagesDocument, InterfacePagesModel>('Pages', pagesSchema);
};

export default connectPagesModel;
