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
import { pagesDefinitions, pagesIndexes } from '../documents/pages';
import { addIndexes, addVirtualProperties, checkDuplicateKeys } from '../helper';
import { PagesDocument, PagesModel } from '../types/pages';
import addPagesHooks from '../hooks/pages';
import { methods, options, queries, statics, virtuals } from '../repositories/pages';

// If a key was found several times, then an error is thrown.
checkDuplicateKeys('pages', [Schema.prototype, pagesDefinitions, methods, statics, queries, virtuals]);

// Create model schema
const schema = new Schema<typeof methods>(pagesDefinitions, options);

schema.methods = { ...methods, ...schema.methods };
schema.statics = { ...statics, ...schema.statics };
schema.query = { ...queries, ...schema.query };

addPagesHooks(schema.pre.bind(schema), schema.post.bind(schema));

addVirtualProperties(schema, virtuals);
addIndexes(schema, pagesIndexes);

/**
 * For the multiple database connections
 */
const connectPages = (conn: Connection): PagesModel => conn.model<PagesDocument, PagesModel>('Pages', schema);

export default connectPages;
