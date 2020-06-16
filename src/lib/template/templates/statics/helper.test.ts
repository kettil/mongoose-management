import { Schema } from 'mongoose';

import * as Helper from './helper';

describe('Check the CollectionDataset class', () => {
  let testSchema: Schema;

  beforeEach(() => {
    testSchema = new Schema({
      foo: String,
      bar: Number,
    });
  });

  test('addIndexes should add the passed index to the schema', () => {
    Helper.addIndexes(testSchema, [
      {
        fields: {
          foo: 1,
        },
        options: {
          unique: true,
        },
      },
    ]);
    expect(testSchema.indexes()).toMatchSnapshot();
  });

  test.each([
    {
      virtualProp: {
        get: () => 'getter',
        set: (val: any) => {
          /* empty */
        },
      },
    },
    {
      virtualProp: {},
    },
  ])('addVirtualProperties should add the passed virtual to the schema', (virtual) => {
    Helper.addVirtualProperties(testSchema, virtual);
    expect(testSchema.indexes()).toMatchSnapshot();
  });

  describe('checkDuplicateKeys in helpers class', () => {
    test('checkDuplicateKeys should not throw if everything is okay', () => {
      const schemaName = 'exampleSchema';
      expect(() => {
        Helper.checkDuplicateKeys(schemaName, [
          {
            foo: true,
            bar: true,
          },
          {
            baz: 1,
            qux: 2,
          },
        ]);
      }).not.toThrow(`Double keys were assigned in the scheme "${schemaName}"`);
    });

    test('checkDuplicateKeys should throw if needed', () => {
      const schemaName = 'exampleSchema';
      expect(() => {
        Helper.checkDuplicateKeys(schemaName, [
          {
            foo: true,
            bar: true,
          },
          {
            baz: 1,
            foo: 2,
          },
        ]);
      }).toThrow(`Double keys were assigned in the scheme "${schemaName}"`);
    });
  });

  test('getDuplicates should return duplicates', () => {
    expect(Helper.getDuplicates(['foo', 'bar', 'baz', 'foo', 'qux', 'baz'])).toEqual(['foo', 'baz']);
  });

  test('extractKeys should return all keys of objects', () => {
    expect(
      Helper.extractKeys([
        {
          foo: true,
          bar: true,
        },
        {
          baz: 1,
          qux: 2,
        },
      ]),
    ).toEqual(['foo', 'bar', 'baz', 'qux']);
  });
});
