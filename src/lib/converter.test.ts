import { convertColumnIndex, converter, converterSubType, recursionSubType } from './converter';

describe('Check the converter functions', () => {
  let dataset: any;
  let column1: any;
  let column2: any;
  let column3: any;
  let column4: any;
  let index1: any;
  let index2: any;

  beforeEach(() => {
    index1 = {
      name: 'email-unique_',
      columns: { email: 1 },
      properties: { unique: true },
      readonly: true,
      mode: 'unique',
      type: 1,
    };
    index2 = { name: 'pwd', columns: { password: -1 }, properties: { unique: false, sparse: true } };

    column1 = { name: 'email', type: 'string', required: true };
    column2 = { name: 'password', type: 'string' };
    column3 = {
      name: 'tags',
      type: 'arrayType',
      subType: { type: 'arrayType', subType: { type: 'string' } },
      required: true,
    };
    column4 = {
      name: 'subObjects',
      type: 'object',
      subColumns: [
        { name: 'subEmail', type: 'string', required: true },
        {
          name: 'subTags',
          type: 'arrayType',
          subType: { type: 'arrayType', subType: { type: 'string' } },
          required: true,
        },
      ],
      required: true,
    };

    dataset = {
      groups: [
        {
          path: 'odm',
          collections: [
            {
              name: 'users',
              columns: [column1, column2, column3, column4],
              indexes: [index1, index2],
            },
          ],
        },
      ],
    };
  });

  test('it should be return a subType array when converterSubType() is called with "column3"', () => {
    const result = converterSubType(column3.subType);

    expect(result).toEqual(['arrayType', 'string']);
  });

  test('it should be update the column object when recursionSubType() is called with "column3"', () => {
    recursionSubType(column3);

    expect(column3).toEqual({
      name: 'tags',
      required: true,
      subTypes: ['arrayType', 'string'],
      type: 'arrayType',
    });
  });

  test('it should be update the column object when recursionSubType() is called with "column4"', () => {
    recursionSubType(column4);

    expect(column4).toEqual({
      name: 'subObjects',
      required: true,
      subColumns: [
        { name: 'subEmail', required: true, type: 'string' },
        { name: 'subTags', required: true, subTypes: ['arrayType', 'string'], type: 'arrayType' },
      ],
      type: 'object',
    });
  });

  test('it should be update the index object when convertColumnIndex() is called with "index1"', () => {
    convertColumnIndex(index1);

    expect(index1).toEqual({
      columns: {
        email: 1,
      },
      name: 'email_',
      properties: {
        unique: true,
      },
      readonly: true,
    });
  });

  test('it should be update the index object when convertColumnIndex() is called with "index2"', () => {
    convertColumnIndex(index2);

    expect(index2).toEqual({
      columns: {
        password: -1,
      },
      name: 'pwd',
      properties: {
        unique: false,
        sparse: true,
      },
    });
  });

  test('it should be update the dataset object when converter() is called with "dataset"', () => {
    converter(dataset);

    expect(dataset).toEqual({
      groups: [
        {
          collections: [
            {
              columns: [
                { name: 'email', required: true, type: 'string' },
                { name: 'password', type: 'string' },
                { name: 'tags', required: true, subTypes: ['arrayType', 'string'], type: 'arrayType' },
                {
                  name: 'subObjects',
                  required: true,
                  subColumns: [
                    { name: 'subEmail', required: true, type: 'string' },
                    { name: 'subTags', required: true, subTypes: ['arrayType', 'string'], type: 'arrayType' },
                  ],
                  type: 'object',
                },
              ],
              indexes: [
                {
                  columns: { email: 1 },
                  name: 'email_',
                  properties: { unique: true },
                  readonly: true,
                },
                {
                  columns: { password: -1 },
                  name: 'pwd',
                  properties: { sparse: true, unique: false },
                },
              ],
              name: 'users',
            },
          ],
          path: 'odm',
        },
      ],
    });
  });
});
