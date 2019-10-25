jest.mock('../../prompts');

import Prompts from '../../prompts';
import CollectionDataset from '../dataset/collection';
import ColumnDataset from '../dataset/column';
import GroupDataset from '../dataset/group';

import ColumnMenu from './column';

import { choicesType } from '../../types';

describe('Check the ColumnMenu class', () => {
  let group: GroupDataset;
  let collection: CollectionDataset;
  let column1: ColumnDataset;
  let column2: ColumnDataset;
  let prompts: any;
  let menu: any;

  beforeEach(() => {
    prompts = new Prompts();

    menu = new ColumnMenu(prompts);

    group = new GroupDataset({ path: 'path/to', collections: [] }, jest.fn() as any);
    group.setReference();

    collection = group.addCollection(
      new CollectionDataset(
        {
          name: 'c1',
          columns: [
            { name: 'column1', type: 'string', populate: 'c1.column2' },
            {
              name: 'column2',
              type: 'object',
              required: true,
              subColumns: [{ name: 'column3', type: 'object', subColumns: [] }],
            },
          ],
          indexes: [{ name: 'column2_', columns: { column2: -1 }, properties: {}, readonly: true }],
        },
        group,
      ),
    );

    column1 = collection.getColumn('column1')!;
    column2 = collection.getColumn('column2')!;
  });

  test('initialize the class', () => {
    expect(menu).toBeInstanceOf(ColumnMenu);

    expect(menu.prompts).toBe(prompts);
  });

  test('it should be return menu selection when exec() is called with type "string"', async () => {
    ((prompts.menu as any) as jest.Mock).mockImplementation((_: string, choices: Array<choicesType<any>>) => {
      expect(choices).toMatchSnapshot();

      return { action: 'edit', data: undefined };
    });

    expect(column1).toBeInstanceOf(ColumnDataset);

    const result = await menu.exec(column1);

    expect(result).toEqual({ action: 'edit', data: undefined });
    expect(prompts.menu).toHaveBeenCalledTimes(1);
    expect(prompts.menu).toHaveBeenCalledWith('Choose a command for the column "column1":', expect.any(Array));
  });

  test.each<[any, string]>([
    ['array', 'Choose a subcolumn or a command for the column "column1[]":'],
    ['object', 'Choose a subcolumn or a command for the column "column1":'],
  ])('it should be return menu selection when exec() is called with type "%s"', async (type, title) => {
    ((prompts.menu as any) as jest.Mock).mockImplementation((_: string, choices: Array<choicesType<any>>) => {
      expect(choices).toMatchSnapshot();

      return { action: 'edit', data: undefined };
    });

    expect(column1).toBeInstanceOf(ColumnDataset);

    column1.set('type', type);

    const result = await menu.exec(column1);

    expect(result).toEqual({ action: 'edit', data: undefined });
    expect(prompts.menu).toHaveBeenCalledTimes(1);
    expect(prompts.menu).toHaveBeenCalledWith(title, expect.any(Array));
  });

  test('it should be return menu selection when exec() is called and the column is a subcolumn', async () => {
    ((prompts.menu as any) as jest.Mock).mockImplementation((_: string, choices: Array<choicesType<any>>) => {
      expect(choices).toMatchSnapshot();

      return { action: 'edit', data: undefined };
    });

    const column = collection.getColumn('column2.column3', true)!;
    expect(column).toBeInstanceOf(ColumnDataset);

    const result = await menu.exec(column);

    expect(result).toEqual({ action: 'edit', data: undefined });
    expect(prompts.menu).toHaveBeenCalledTimes(1);
    expect(prompts.menu).toHaveBeenCalledWith(
      'Choose a subcolumn or a command for the column "column2.column3":',
      expect.any(Array),
    );
  });

  test('it should be return menu selection when getChoiceList() is called with columns', () => {
    const result = menu.getChoiceList(collection.getColumns());

    expect(result).toMatchSnapshot();
  });

  test('it should be return menu selection when getChoiceList() is called without columns', () => {
    collection.getColumns().forEach((c) => c.remove());

    const result = menu.getChoiceList(collection.getColumns());

    expect(result).toMatchSnapshot();
  });

  test('it should be return menu selection when getChoiceList() is called with subcolumns', () => {
    const result = menu.getChoiceList(column2.getColumns(), column2);

    expect(result).toMatchSnapshot();
  });

  test('it should be return columns table when createTable() is called', () => {
    const result = menu.createTable(collection.getColumns());

    expect(result).toMatchSnapshot();
  });

  test.each<[any]>([['index'], ['unique'], ['sparse']])(
    'it should be return index table column when createTableIndexRow() is called',
    (type) => {
      expect(column2).toBeInstanceOf(ColumnDataset);

      column2.setIndex(-1, type);

      const result = menu.createTableIndexRow(column2);

      expect(result).toMatchSnapshot();
    },
  );
});
