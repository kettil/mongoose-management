jest.mock('../../prompts');

import Prompts from '../../prompts';
import CollectionDataset from '../dataset/collection';
import IndexDataset from '../dataset/index';

import IndexMenu from './index';

import { choicesType } from '../../types';

describe('Check the IndexMenu class', () => {
  let prompts: any;
  let menu: any;

  beforeEach(() => {
    prompts = new Prompts();

    menu = new IndexMenu(prompts);
  });

  test('initialize the class', () => {
    expect(menu).toBeInstanceOf(IndexMenu);

    expect(menu.prompts).toBe(prompts);
  });

  test('it should be return menu selection when exec() is called', async () => {
    ((prompts.menu as any) as jest.Mock).mockImplementation((_: string, choices: choicesType<any>[]) => {
      expect(choices).toMatchSnapshot();

      return { action: 'edit', data: undefined };
    });

    const collection = new CollectionDataset(
      {
        name: 'c1',
        columns: [{ name: 'column1', type: 'string' }],
        indexes: [{ name: 'index1', columns: { column1: 1 }, properties: {} }],
      },
      jest.fn() as any,
    );
    collection.setReference();

    const index = collection.getIndex('index1')!;

    expect(index).toBeInstanceOf(IndexDataset);

    const result = await menu.exec(index);

    expect(result).toEqual({ action: 'edit', data: undefined });
    expect(prompts.menu).toHaveBeenCalledTimes(1);
    expect(prompts.menu).toHaveBeenCalledWith('Choose a command for the index "index1":', expect.any(Array));
  });
});
