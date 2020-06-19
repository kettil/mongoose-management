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

import { uuidGetter, uuidSetter, bson, uuidv4 } from '../uuidHelpers';

/**
 *
 */
export type tTypes = { _id: any; a: string[][]; g: Array<{ _id: any; o: { _id: any; q: string }; u?: string }> };

/**
 *
 */
export const tDefinitions = {
  _id: {
    type: Buffer,
    get: uuidGetter,
    set: uuidSetter,
    subtype: bson.Binary.SUBTYPE_UUID,
    default: uuidv4,
    required: true,
  },
  a: [[{ type: Schema.Types.String, required: true, default: [] }]],
  g: [
    {
      _id: {
        type: Buffer,
        get: uuidGetter,
        set: uuidSetter,
        subtype: bson.Binary.SUBTYPE_UUID,
        default: uuidv4,
        required: true,
      },
      o: {
        _id: {
          type: Buffer,
          get: uuidGetter,
          set: uuidSetter,
          subtype: bson.Binary.SUBTYPE_UUID,
          default: uuidv4,
          required: true,
        },
        q: { type: Schema.Types.String, required: true },
      },
      u: { type: Schema.Types.String, default: 'bla' },
    },
  ],
};

/**
 *
 */
export const tIndexes: indexType[] = [];
