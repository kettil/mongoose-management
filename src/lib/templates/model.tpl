/**
 * ######################################################################
 * #                                                                    #
 * #                       Do not change the file!                      #
 * #                                                                    #
 * # All changes are deleted the next time the collection data is read. #
 * #                                                                    #
 * ######################################################################
 */

import mongoose, { Connection, Schema } from 'mongoose';

import { {{collectionNameLower}}SchemaDefinition } from '../documents/{{collectionNameLower}}';
import {{collectionNameUpper}} from '../interfaces/{{collectionNameLower}}';
import { methods, options, query, statics, virtual } from '../repositories/{{collectionNameLower}}';

import { addVirtualProperties, extractKeys, getDuplicates } from '../helper';

const duplicatesKeys = getDuplicates(
  extractKeys([Schema.prototype, {{collectionNameLower}}SchemaDefinition, methods, statics, query, virtual]),
);

if (duplicatesKeys.length > 0) {
  throw new Error('Double keys were assigned in the scheme: ' + duplicatesKeys.join(', '));
}

/**
 * create model schema
 */
export const {{collectionNameLower}}Schema = new Schema({{collectionNameLower}}SchemaDefinition, options);

{{collectionNameLower}}Schema.methods = { ...methods, ...{{collectionNameLower}}Schema.methods };
{{collectionNameLower}}Schema.statics = { ...statics, ...{{collectionNameLower}}Schema.statics };
{{collectionNameLower}}Schema.query = { ...query, ...{{collectionNameLower}}Schema.query };
addVirtualProperties({{collectionNameLower}}Schema, virtual);

/**
 * For multiple database connections
 *
 * @param handler
 * @param collection
 */
export const create{{collectionNameUpper}}Model = (handler: Connection) => {
  return handler.model<{{collectionNameUpper}}.IDocument, {{collectionNameUpper}}.IModel>('{{collectionNameLower}}', {{collectionNameLower}}Schema);
};

/**
 * Create default model with default connection
 */
const Model = mongoose.model<{{collectionNameUpper}}.IDocument, {{collectionNameUpper}}.IModel>(
  '{{collectionNameUpper}}',
  {{collectionNameLower}}Schema,
);

export default Model;
