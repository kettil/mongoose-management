jest.mock('../../prompts');
jest.mock('../dataset/collection');
jest.mock('../dataset/group');

import Prompts, { regexpName, regexpNameMessage } from '../../prompts';
import CollectionDataset from '../dataset/collection';
import GroupDataset from '../dataset/group';

import { call, evaluation, getQuestions, validateName } from './collectionMain';

/**
 *
 */
describe('Check the prompts collectionMain functions', () => {
  /**
   *
   */
  test('it should be return the answers when call() is called', async () => {
    const prompts = new (Prompts as any)();
    const group = new (GroupDataset as any)();
    const collection1 = new (CollectionDataset as any)();
    const collection2 = new (CollectionDataset as any)();

    (collection1.getName as jest.Mock).mockReturnValue('oldName1');
    (collection2.getName as jest.Mock).mockReturnValue('oldName2');
    (group.getCollections as jest.Mock).mockReturnValue([collection1, collection2]);

    (prompts.call as jest.Mock).mockResolvedValue({ name: 'collectionName' });

    const result = await call(prompts, group);

    expect(result).toEqual({ name: 'collectionName' });

    expect(prompts.call).toHaveBeenCalledTimes(1);
    expect(prompts.call).toHaveBeenCalledWith([
      { default: undefined, message: 'Collection name:', name: 'name', type: 'input', validate: expect.any(Function) },
    ]);

    expect(collection1.getName).toHaveBeenCalledTimes(1);
    expect(collection2.getName).toHaveBeenCalledTimes(1);
    expect(group.getCollections).toHaveBeenCalledTimes(1);
  });

  /**
   *
   */
  test('it should be throw an error when call() is called and name is empty', async () => {
    const prompts = new (Prompts as any)();
    const group = new (GroupDataset as any)();
    const collection1 = new (CollectionDataset as any)();
    const collection2 = new (CollectionDataset as any)();

    (collection1.getName as jest.Mock).mockReturnValue('oldName1');
    (collection2.getName as jest.Mock).mockReturnValue('oldName2');
    (group.getCollections as jest.Mock).mockReturnValue([collection1, collection2]);

    (prompts.call as jest.Mock).mockResolvedValue({ name: '' });

    expect.assertions(7);
    try {
      await call(prompts, group);
    } catch (err) {
      expect(err).toBeInstanceOf(Error);
      expect(err.message).toBe('cancel');

      expect(prompts.call).toHaveBeenCalledTimes(1);
      expect(prompts.call).toHaveBeenCalledWith([
        {
          default: undefined,
          message: 'Collection name:',
          name: 'name',
          type: 'input',
          validate: expect.any(Function),
        },
      ]);

      expect(group.getCollections).toHaveBeenCalledTimes(1);
      expect(collection1.getName).toHaveBeenCalledTimes(1);
      expect(collection2.getName).toHaveBeenCalledTimes(1);
    }
  });

  /**
   *
   */
  test('it should be return the questions array then getQuestions() is called', () => {
    const group = new (GroupDataset as any)();
    const collection1 = new (CollectionDataset as any)();
    const collection2 = new (CollectionDataset as any)();

    (collection1.getName as jest.Mock).mockReturnValue('oldName1');
    (collection2.getName as jest.Mock).mockReturnValue('oldName2');
    (group.getCollections as jest.Mock).mockReturnValue([collection1, collection2]);

    const result = getQuestions(group);

    expect(result).toEqual([
      { message: 'Collection name:', name: 'name', type: 'input', validate: expect.any(Function) },
    ]);

    expect(group.getCollections).toHaveBeenCalledTimes(1);
    expect(collection1.getName).toHaveBeenCalledTimes(1);
    expect(collection2.getName).toHaveBeenCalledTimes(1);
  });

  /**
   *
   */
  test('it should be return the questions array then getQuestions() is called with collection', () => {
    const group = new (GroupDataset as any)();
    const collection1 = new (CollectionDataset as any)();
    const collection2 = new (CollectionDataset as any)();

    (collection1.getName as jest.Mock).mockReturnValue('oldName1');
    (collection2.getName as jest.Mock).mockReturnValue('oldName2');
    (group.getCollections as jest.Mock).mockReturnValue([collection1, collection2]);

    const result = getQuestions(group, collection2);

    expect(result).toEqual([
      { default: 'oldName2', message: 'Collection name:', name: 'name', type: 'input', validate: expect.any(Function) },
    ]);

    expect(group.getCollections).toHaveBeenCalledTimes(1);
    expect(collection1.getName).toHaveBeenCalledTimes(1);
    expect(collection2.getName).toHaveBeenCalledTimes(1);
  });

  /**
   *
   */
  test('it should be return the collection when evaluation() is called', () => {
    const group = new (GroupDataset as any)();

    (group.addCollection as jest.Mock).mockImplementation((a) => a);

    const closure = evaluation({ name: 'cName' }, group);

    expect(closure).toEqual(expect.any(Function));

    const result = closure();

    expect(result).toBeInstanceOf(CollectionDataset);

    expect(CollectionDataset).toHaveBeenCalledTimes(1);
    expect(CollectionDataset).toHaveBeenCalledWith({ name: 'cName', columns: [], indexes: [] }, group);

    expect(group.addCollection).toHaveBeenCalledTimes(1);
    expect(group.addCollection).toHaveBeenCalledWith(expect.any(CollectionDataset));
  });

  /**
   *
   */
  test('it should be return the collection when evaluation() is called with collection', () => {
    const group = new (GroupDataset as any)();
    const collection = new (CollectionDataset as any)();

    const closure = evaluation({ name: 'cName' }, group);

    expect(closure).toEqual(expect.any(Function));

    const result = closure(collection);

    expect(result).toBeInstanceOf(CollectionDataset);

    expect(CollectionDataset).toHaveBeenCalledTimes(1);
    expect(CollectionDataset).toHaveBeenCalledWith();

    expect(group.addCollection).toHaveBeenCalledTimes(0);

    expect(collection.setName).toHaveBeenCalledTimes(1);
    expect(collection.setName).toHaveBeenCalledWith('cName');
  });

  /**
   *
   */
  test.each<[string, string, string | boolean, boolean, string]>([
    ['true', 'name9  ', true, true, 'name9'],
    ['string', 'name9  ', regexpNameMessage, false, 'name9'],
    ['string', 'name2', 'A collection with the name already exists!', true, 'name2'],
  ])('it should be return %s when validateName() is called (%p)', (_, name, expected, regexpReturn, regexpValue) => {
    const mock = jest.fn().mockReturnValue(regexpReturn);

    regexpName.test = mock;

    const closure = validateName(['name1', 'name2']);

    expect(closure).toEqual(expect.any(Function));

    const result = closure(name);

    expect(result).toEqual(expected);

    expect(mock).toHaveBeenCalledTimes(1);
    expect(mock).toHaveBeenCalledWith(regexpValue);
  });
});
