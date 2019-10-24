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
export type pagesTypes = {
  content?: Array<{
    createdAt: Date;
    deletedAt?: Date;
    locale: string;
    message: string;
    subject: string;
    updatedAt?: Array<{ date: Date; user: any }>;
  }>;
  tags?: string[];
  user: any;
};

/**
 *
 */
export const pagesDefinitions = {
  content: [
    {
      createdAt: { type: Schema.Types.Date, required: true },
      deletedAt: { type: Schema.Types.Date },
      locale: { type: Schema.Types.String, required: true },
      message: { type: Schema.Types.String, required: true },
      subject: { type: Schema.Types.String, required: true },
      updatedAt: [
        { date: { type: Schema.Types.Date, required: true }, user: { type: Schema.Types.ObjectId, required: true } },
      ],
    },
  ],
  tags: [{ type: Schema.Types.String }],
  user: { type: Schema.Types.ObjectId, required: true },
};

/**
 *
 */
export const pagesIndexes: indexType[] = [{ fields: { 'content.locale': 1 }, options: { name: 'content.locale_' } }];
