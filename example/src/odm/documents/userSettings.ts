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

import { Schema } from 'mongoose';
import { IndexType } from '../types';

export type UserSettingsTypes = { key: string; user: any; value1: { _id: any }; value2?: any };

export const userSettingsDefinitions = {
  _id: { type: Schema.Types.ObjectId, required: true },
  key: { type: Schema.Types.String, required: true },
  user: { type: Schema.Types.ObjectId, required: true, ref: 'Users' },
  value1: { _id: { type: Schema.Types.ObjectId, required: true } },
  value2: { type: Schema.Types.Mixed },
};

export const userSettingsIndexes: IndexType[] = [
  { fields: { key: 1, user: 1, value1: 1 }, options: { name: 'unique', unique: true, sparse: true } },
];
