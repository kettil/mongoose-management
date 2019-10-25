/**
 * ######################################################################
 * #                                                                    #
 * #                       Do not change the file!                      #
 * #                                                                    #
 * # All changes are deleted the next time the collection data is read. #
 * #                                                                    #
 * ######################################################################
 */

import { Schema } from 'mongoose';

import { indexType } from '../types';

/**
 *
 */
export type userSettingsTypes = { key: string; user: any; value?: Record<string, any> };

/**
 *
 */
export const userSettingsDefinitions = {
  key: { type: Schema.Types.String, required: true },
  user: { type: Schema.Types.ObjectId, required: true, ref: 'Users' },
  value: { type: Schema.Types.Mixed },
};

/**
 *
 */
export const userSettingsIndexes: indexType[] = [
  { fields: { key: 1, user: 1, value: 1 }, options: { name: 'unique', unique: true, sparse: true } },
];
