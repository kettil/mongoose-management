import Prompts from '../../prompts';
import CollectionDataset from '../dataset/collection';
import GroupDataset from '../dataset/group';

import execute from './collection';

const mockCall = jest.fn();

describe('Check the prompts collection function', () => {
  let prompts: Prompts;
  let group: GroupDataset;
  let collection: CollectionDataset;

  beforeEach(() => {
    prompts = { call: mockCall } as any;

    group = new GroupDataset(
      {
        path: 'path',
        collections: [
          {
            name: 'collection',
            idType: 'objectId',
            columns: [],
            indexes: [],
          },
        ],
        multipleConnection: true,
        idType: 'uuidv4',
      },
      jest.fn() as any,
    );
    group.setReference();

    collection = group.getCollection('collection')!;
  });

  test('it should be return the collection when execute() is called', async () => {
    expect.assertions(4);

    mockCall.mockImplementation((questions) => {
      expect(questions).toEqual([
        {
          default: 'collection',
          message: 'Collection name:',
          name: 'name',
          type: 'input',
          validate: expect.any(Function),
        },
        {
          name: 'idType',
          message: "Type of '_id' column:",
          type: 'list',
          default: 'objectId',
          choices: [
            { name: 'Global (UUIDv4)', short: 'Global', value: undefined },
            { name: 'ObjectId', short: 'ObjectId', value: 'objectId' },
            { name: 'UUIDv4', short: 'UUIDv4', value: 'uuidv4' },
          ],
        },
      ]);

      return { name: 'newCollectionName' };
    });

    expect(collection).toBeInstanceOf(CollectionDataset);

    const result = await execute(prompts, group, collection);

    expect(result).toBe(collection);
    expect(result.getObject()).toEqual({
      name: 'newCollectionName',
      columns: [],
      indexes: [],
    });
  });
});
