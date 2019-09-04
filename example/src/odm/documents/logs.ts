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
export type logsTypes = { message: string; tags?: string[]; user: any };

/**
 *
 */
export const logsDefinitions = {
  message: { type: Schema.Types.String, required: true },
  tags: { type: [Schema.Types.String] },
  user: { type: Schema.Types.ObjectId, required: true },
};

/**
 *
 */
export const logsIndexes: indexType[] = [];
