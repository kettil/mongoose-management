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
export type usersTypes = { _id: any; children?: any[]; email: string; pages?: any[]; password: string };

/**
 *
 */
export const usersDefinitions = {
  _id: { type: Schema.Types.ObjectId, required: true },
  children: [{ type: Schema.Types.ObjectId, ref: 'Users' }],
  email: { type: Schema.Types.String, required: true },
  pages: [{ type: Schema.Types.ObjectId, ref: 'Pages.content' }],
  password: { type: Schema.Types.String, required: true },
};

/**
 *
 */
export const usersIndexes: indexType[] = [{ fields: { email: -1 }, options: { name: 'email_', unique: true } }];
