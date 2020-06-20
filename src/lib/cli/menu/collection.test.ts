jest.mock('../../prompts');

import Prompts from '../../prompts';
import CollectionDataset from '../dataset/collection';
import ColumnMenu from './column';

import CollectionMenu from './collection';

import { choicesType } from '../../types';

describe('Check the CollectionMenu class', () => {
  let collection: CollectionDataset;
  let prompts: any;
  let menu: any;

  beforeEach(() => {
    collection = new CollectionDataset(
      {
        name: 'c1',
        columns: [{ name: 'column1', type: 'string' }],
        indexes: [{ name: 'index1', columns: { column1: 1 }, properties: {} }],
        idType: 'uuidv4',
      },
      jest.fn() as any,
    );
    collection.setReference();

    prompts = new Prompts();

    menu = new CollectionMenu(prompts);
  });

  test('initialize the class', () => {
    expect(menu).toBeInstanceOf(CollectionMenu);

    expect(menu.prompts).toBe(prompts);
    expect(menu.columnMenu).toBeInstanceOf(ColumnMenu);
  });

  test('it should be return menu selection when exec() is called', async () => {
    ((prompts.menu as any) as jest.Mock).mockImplementation((_: string, choices: choicesType<any>[]) => {
      expect(choices).toMatchSnapshot();

      return { action: 'edit', data: undefined };
    });

    const result = await menu.exec(collection);

    expect(result).toEqual({ action: 'edit', data: undefined });
    expect(prompts.menu).toHaveBeenCalledTimes(1);
    expect(prompts.menu).toHaveBeenCalledWith('Choose a column/index or a command:', expect.any(Array));
  });

  test('it should be return menu selection when getChoiceIndexList() is called with indexes', () => {
    collection.getColumn('column1')!.setIndex(1, 'index');

    const result = menu.getChoiceIndexList(collection.getIndexes());

    expect(result).toMatchSnapshot();
  });

  test('it should be return menu selection when getChoiceIndexList() is called without indexes', () => {
    collection.getIndexes().forEach((i) => i.remove());

    const result = menu.getChoiceIndexList(collection.getIndexes());

    expect(result).toMatchSnapshot();
  });

  test.each<[any]>([['index'], ['unique'], ['sparse']])(
    'it should be return indexes table when createIndexTable() is called with type "%s"',
    (type) => {
      collection.getColumn('column1')!.setIndex(1, type);

      const result = menu.createIndexTable(collection.getIndexes());

      expect(result).toMatchSnapshot();
    },
  );
});
