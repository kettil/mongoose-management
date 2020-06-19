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
export type logsTypes = { _id: any; data?: { _id: any }; message: string; tags?: string[]; user: any };

/**
 *
 */
export const logsDefinitions = {
  _id: { type: Schema.Types.ObjectId, required: true },
  data: { _id: { type: Schema.Types.ObjectId, required: true } },
  message: { type: Schema.Types.String, required: true },
  tags: [{ type: Schema.Types.String }],
  user: { type: Schema.Types.ObjectId, required: true, ref: 'Users' },
};

/**
 *
 */
export const logsIndexes: indexType[] = [];
