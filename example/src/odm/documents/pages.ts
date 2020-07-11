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
import { uuidGetter, uuidSetter, bson, uuidv4 } from '../uuidHelpers';

export type PagesTypes = {
  content?: Array<{
    _id: string | Buffer;
    createdAt: Date;
    deletedAt?: Date;
    locale: string;
    message: string;
    subject: string;
    updatedAt?: Array<{ _id: string | Buffer; date: Date; user: any }>;
  }>;
  tags?: string[];
  user: any;
};

export const pagesDefinitions = {
  _id: {
    type: Buffer,
    get: uuidGetter,
    set: uuidSetter,
    subtype: bson.Binary.SUBTYPE_UUID,
    default: uuidv4,
    required: true,
  },
  content: [
    {
      _id: {
        type: Buffer,
        get: uuidGetter,
        set: uuidSetter,
        subtype: bson.Binary.SUBTYPE_UUID,
        default: uuidv4,
        required: true,
      },
      createdAt: { type: Schema.Types.Date, required: true },
      deletedAt: { type: Schema.Types.Date },
      locale: { type: Schema.Types.String, required: true },
      message: { type: Schema.Types.String, required: true },
      subject: { type: Schema.Types.String, required: true },
      updatedAt: [
        {
          _id: {
            type: Buffer,
            get: uuidGetter,
            set: uuidSetter,
            subtype: bson.Binary.SUBTYPE_UUID,
            default: uuidv4,
            required: true,
          },
          date: { type: Schema.Types.Date, required: true },
          user: { type: Schema.Types.ObjectId, required: true, ref: 'Users' },
        },
      ],
    },
  ],
  tags: [{ type: Schema.Types.String }],
  user: { type: Schema.Types.ObjectId, required: true, ref: 'Users' },
};

export const pagesIndexes: IndexType[] = [{ fields: { 'content.locale': 1 }, options: { name: 'content.locale_' } }];
