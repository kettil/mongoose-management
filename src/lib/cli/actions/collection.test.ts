jest.mock('../../prompts');
jest.mock('../questions');

import Prompts from '../../prompts';

import * as questions from '../questions';

import Collection from './collection';

import { Separator } from 'inquirer';

/**
 *
 */
describe('Check the Collection class', () => {
  let prompts: Prompts;
  let collection: Collection;

  /**
   *
   */
  beforeEach(() => {
    prompts = new Prompts();

    collection = new Collection(prompts);
  });

  /**
   *
   */
  test('initialize the class', async () => {
    expect(collection).toBeInstanceOf(Collection);
  });

  /**
   *
   */
  test('it should be return menu items when getMenuItems() is called', () => {
    const groups = [{ name: 'name1', columns: [], indexes: [] }, { name: 'name2', columns: [], indexes: [] }];

    const items = collection.getMenuItems(groups);

    expect.assertions(groups.length + 1);

    expect(items).toEqual([
      { name: 'name1', short: 'name1', value: { value: groups[0] } },
      { name: 'name2', short: 'name2', value: { value: groups[1] } },
    ]);

    for (let i = 0; i < groups.length; i += 1) {
      const item = items[i];
      const group = groups[i];

      if (!(item instanceof Separator)) {
        expect(item.value.value).toBe(group);
      }
    }
  });

  /**
   *
   */
  test('it should be return a new collecttion when create() is called', async () => {
    (prompts.call as jest.Mock).mockResolvedValueOnce({ name: 'collection1' });
    (questions.collectionMainQuestions as jest.Mock).mockReturnValueOnce(['a', 'b']);
    (questions.collectionMainEvaluation as jest.Mock).mockReturnValueOnce({ name: 'n', collections: [], indexes: [] });

    const result = await collection.create([
      { name: 'c1', columns: [], indexes: [] },
      { name: 'c2', columns: [], indexes: [] },
    ]);

    expect(result).toEqual({ name: 'n', collections: [], indexes: [] });

    expect(prompts.call).toHaveBeenCalledTimes(1);
    expect(prompts.call).toHaveBeenCalledWith(['a', 'b']);

    expect(questions.collectionMainQuestions).toHaveBeenCalledTimes(1);
    expect(questions.collectionMainQuestions).toHaveBeenCalledWith(undefined, [
      { name: 'c1', columns: [], indexes: [] },
      { name: 'c2', columns: [], indexes: [] },
    ]);

    expect(questions.collectionMainEvaluation).toHaveBeenCalledTimes(1);
    expect(questions.collectionMainEvaluation).toHaveBeenCalledWith(undefined, { name: 'collection1' });
  });

  /**
   *
   */
  test('it should be return false when create() is called with empty name', async () => {
    (prompts.call as jest.Mock).mockResolvedValueOnce({ name: '' });
    (questions.collectionMainQuestions as jest.Mock).mockReturnValueOnce(['a', 'b']);

    const result = await collection.create([
      { name: 'c1', columns: [], indexes: [] },
      { name: 'c2', columns: [], indexes: [] },
    ]);

    expect(result).toEqual(false);

    expect(prompts.call).toHaveBeenCalledTimes(1);
    expect(prompts.call).toHaveBeenCalledWith(['a', 'b']);

    expect(questions.collectionMainQuestions).toHaveBeenCalledTimes(1);
    expect(questions.collectionMainQuestions).toHaveBeenCalledWith(undefined, [
      { name: 'c1', columns: [], indexes: [] },
      { name: 'c2', columns: [], indexes: [] },
    ]);

    expect(questions.collectionMainEvaluation).toHaveBeenCalledTimes(0);
  });

  /**
   *
   */
  test('it should be update the collecttion when edit() is called', async () => {
    (prompts.call as jest.Mock).mockResolvedValueOnce({ name: 'collection1' });
    (questions.collectionMainQuestions as jest.Mock).mockReturnValueOnce(['a', 'b']);
    (questions.collectionMainEvaluation as jest.Mock).mockReturnValueOnce({ name: 'n', collections: [], indexes: [] });

    await collection.edit([{ name: 'c1', columns: [], indexes: [] }, { name: 'c2', columns: [], indexes: [] }], {
      name: 'c2',
      columns: [],
      indexes: [],
    });

    expect(prompts.call).toHaveBeenCalledTimes(1);
    expect(prompts.call).toHaveBeenCalledWith(['a', 'b']);

    expect(questions.collectionMainQuestions).toHaveBeenCalledTimes(1);
    expect(questions.collectionMainQuestions).toHaveBeenCalledWith({ name: 'c2', columns: [], indexes: [] }, [
      { name: 'c1', columns: [], indexes: [] },
      { name: 'c2', columns: [], indexes: [] },
    ]);

    expect(questions.collectionMainEvaluation).toHaveBeenCalledTimes(1);
    expect(questions.collectionMainEvaluation).toHaveBeenCalledWith(
      { name: 'c2', columns: [], indexes: [] },
      { name: 'collection1' },
    );
  });

  /**
   *
   */
  test('it should be not update the collecttion when edit() is called with empty name', async () => {
    (prompts.call as jest.Mock).mockResolvedValueOnce({ name: '' });
    (questions.collectionMainQuestions as jest.Mock).mockReturnValueOnce(['a', 'b']);

    await collection.edit([{ name: 'c1', columns: [], indexes: [] }, { name: 'c2', columns: [], indexes: [] }], {
      name: 'c2',
      columns: [],
      indexes: [],
    });

    expect(prompts.call).toHaveBeenCalledTimes(1);
    expect(prompts.call).toHaveBeenCalledWith(['a', 'b']);

    expect(questions.collectionMainQuestions).toHaveBeenCalledTimes(1);
    expect(questions.collectionMainQuestions).toHaveBeenCalledWith({ name: 'c2', columns: [], indexes: [] }, [
      { name: 'c1', columns: [], indexes: [] },
      { name: 'c2', columns: [], indexes: [] },
    ]);

    expect(questions.collectionMainEvaluation).toHaveBeenCalledTimes(0);
  });

  /**
   *
   */
  test('it should be return false when remove() is called without collections', async () => {
    const result = await collection.remove([]);

    expect(result).toBe(false);
  });

  /**
   *
   */
  test('it should be return array with string when remove() is called with one collections', async () => {
    (prompts.call as jest.Mock).mockResolvedValueOnce({ collections: ['c2'], isConfirm: true });
    (questions.collectionRemoveQuestions as jest.Mock).mockReturnValueOnce(['a', 'b']);

    const result = await collection.remove([{ name: 'c2', columns: [], indexes: [] }]);

    expect(result).toEqual(['c2']);

    expect(questions.collectionRemoveQuestions).toHaveBeenCalledTimes(1);
    expect(questions.collectionRemoveQuestions).toHaveBeenCalledWith([{ columns: [], indexes: [], name: 'c2' }]);

    expect(prompts.call).toHaveBeenCalledTimes(1);
    expect(prompts.call).toHaveBeenCalledWith(['a', 'b']);
  });

  /**
   *
   */
  test('it should be return array with string when remove() is called with two collections', async () => {
    (prompts.call as jest.Mock).mockResolvedValueOnce({ collections: ['c2'], isConfirm: true });
    (questions.collectionRemoveQuestions as jest.Mock).mockReturnValueOnce(['a', 'b']);

    const result = await collection.remove([
      { name: 'c1', columns: [], indexes: [] },
      { name: 'c2', columns: [], indexes: [] },
    ]);

    expect(result).toEqual(['c2']);

    expect(questions.collectionRemoveQuestions).toHaveBeenCalledTimes(1);
    expect(questions.collectionRemoveQuestions).toHaveBeenCalledWith([
      { columns: [], indexes: [], name: 'c1' },
      { columns: [], indexes: [], name: 'c2' },
    ]);

    expect(prompts.call).toHaveBeenCalledTimes(1);
    expect(prompts.call).toHaveBeenCalledWith(['a', 'b']);
  });

  /**
   *
   */
  test('it should be return false when remove() is called with two collections and without confirm', async () => {
    (prompts.call as jest.Mock).mockResolvedValueOnce({ collections: ['c2'], isConfirm: false });
    (questions.collectionRemoveQuestions as jest.Mock).mockReturnValueOnce(['a', 'b']);

    const result = await collection.remove([
      { name: 'c1', columns: [], indexes: [] },
      { name: 'c2', columns: [], indexes: [] },
    ]);

    expect(result).toBe(false);

    expect(questions.collectionRemoveQuestions).toHaveBeenCalledTimes(1);
    expect(questions.collectionRemoveQuestions).toHaveBeenCalledWith([
      { columns: [], indexes: [], name: 'c1' },
      { columns: [], indexes: [], name: 'c2' },
    ]);

    expect(prompts.call).toHaveBeenCalledTimes(1);
    expect(prompts.call).toHaveBeenCalledWith(['a', 'b']);
  });

  const datasetSort: Array<[number, any, any]> = [
    [-1, { name: 'c1' }, { name: 'c2' }],
    [1, { name: 'c2' }, { name: 'c1' }],
    [0, { name: 'c3' }, { name: 'c3' }],
  ];

  /**
   *
   */
  test.each(datasetSort)('it should be return %p when sort() is called (%p, %p)', (expected, c1, c2) => {
    const result = collection.sort(c1, c2);

    expect(result).toBe(expected);
  });
});
