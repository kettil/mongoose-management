import Prompts, { regexpNameMessage } from '../../prompts';
import CollectionDataset from '../dataset/collection';
import GroupDataset from '../dataset/group';
import { CancelPromptError } from '../errors';

import { call, evaluation, getQuestions, validateName } from './collectionMain';

const mockCall = jest.fn();

describe('Check the prompts collectionMain functions', () => {
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
            name: 'collect1',
            columns: [],
            indexes: [],
          },
        ],
      },
      jest.fn() as any,
    );
    group.setReference();

    collection = group.getCollection('collect1')!;
  });

  test('it should be return the answers when call() is called', async () => {
    expect.assertions(3);

    mockCall.mockImplementation((questions) => {
      expect(questions).toEqual([
        { message: 'Collection name:', name: 'name', type: 'input', validate: expect.any(Function) },
      ]);

      return { name: 'newCollection' };
    });

    const result = await call(prompts, group);

    expect(result).toEqual({ name: 'newCollection' });
    expect(prompts.call).toHaveBeenCalledTimes(1);
  });

  test('it should be throw an error when call() is called and name is empty', async () => {
    expect.assertions(4);

    mockCall.mockImplementation((questions) => {
      expect(questions).toEqual([
        { message: 'Collection name:', name: 'name', type: 'input', validate: expect.any(Function) },
      ]);

      return { name: '' };
    });

    try {
      await call(prompts, group);
    } catch (err) {
      expect(err).toBeInstanceOf(CancelPromptError);
      expect(err.message).toBe('cancel');

      expect(prompts.call).toHaveBeenCalledTimes(1);
    }
  });

  test('it should be return the questions array then getQuestions() is called', async () => {
    const result = await getQuestions(group);

    expect(result).toEqual([
      { message: 'Collection name:', name: 'name', type: 'input', validate: expect.any(Function) },
    ]);
  });

  test('it should be return the questions array then getQuestions() is called with collection', async () => {
    expect(collection).toBeInstanceOf(CollectionDataset);

    const result = await getQuestions(group, collection);

    expect(result).toEqual([
      { default: 'collect1', message: 'Collection name:', name: 'name', type: 'input', validate: expect.any(Function) },
    ]);
  });

  test('it should be return the collection when evaluation() is called', async () => {
    const callback = await evaluation({ name: 'newCollection' }, group);

    expect(callback).toEqual(expect.any(Function));

    const result = callback();

    expect(result).toBeInstanceOf(CollectionDataset);
    expect(group.getObject()).toEqual({
      collections: [
        { columns: [], indexes: [], name: 'collect1' },
        { columns: [], indexes: [], name: 'newCollection' },
      ],
      path: 'path',
    });
  });

  test('it should be return the collection when evaluation() is called with collection', async () => {
    expect(collection).toBeInstanceOf(CollectionDataset);

    const callback = await evaluation({ name: 'newCollection' }, group);

    expect(callback).toEqual(expect.any(Function));

    const result = callback(collection);

    expect(result).toBe(collection);
    expect(group.getObject()).toEqual({
      collections: [{ columns: [], indexes: [], name: 'newCollection' }],
      path: 'path',
    });
  });

  test.each<[string, string, string | boolean]>([
    ['true', ' name9 ', true],
    ['string', '_name', regexpNameMessage],
    ['string', 'name2', 'A collection with the name already exists!'],
  ])('it should be return %s when validateName() is called (%p)', (_, name, expected) => {
    const closure = validateName(['name1', 'name2']);

    expect(closure).toEqual(expect.any(Function));

    const result = closure(name);

    expect(result).toEqual(expected);
  });
});
