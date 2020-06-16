jest.mock('../../prompts');

import Prompts from '../../prompts';
import GroupDataset from '../dataset/group';

import GroupMenu from './group';

import { choicesType } from '../../types';

describe('Check the GroupMenu class', () => {
  let group: GroupDataset;
  let prompts: any;
  let menu: any;

  beforeEach(() => {
    group = new GroupDataset(
      {
        path: 'path',
        collections: [
          { name: 'collection2', columns: [], indexes: [] },
          { name: 'collection1', columns: [], indexes: [] },
        ],
      },
      jest.fn() as any,
    );
    group.setReference();

    prompts = new Prompts();

    menu = new GroupMenu(prompts);
  });

  test('initialize the class', () => {
    expect(menu).toBeInstanceOf(GroupMenu);

    expect(menu.prompts).toBe(prompts);
  });

  test('it should be return menu selection when exec() is called with collections', async () => {
    ((prompts.menu as any) as jest.Mock).mockImplementation((_: string, choices: choicesType<any>[]) => {
      expect(choices).toMatchSnapshot();

      return { action: 'edit', data: undefined };
    });

    const result = await menu.exec(group);

    expect(result).toEqual({ action: 'edit', data: undefined });
    expect(prompts.menu).toHaveBeenCalledTimes(1);
    expect(prompts.menu).toHaveBeenCalledWith('Choose a collection or a command:', expect.any(Array));
  });

  test('it should be return menu selection when exec() is called without collections', async () => {
    ((prompts.menu as any) as jest.Mock).mockImplementation((_: string, choices: choicesType<any>[]) => {
      expect(choices).toMatchSnapshot();

      return { action: 'edit', data: undefined };
    });

    group.getCollections().forEach((c) => c.remove());

    const result = await menu.exec(group);

    expect(result).toEqual({ action: 'edit', data: undefined });
    expect(prompts.menu).toHaveBeenCalledTimes(1);
    expect(prompts.menu).toHaveBeenCalledWith('Choose a collection or a command:', expect.any(Array));
  });

  test('it should be return adjusted collections when getChoiceList() is called', () => {
    const result = menu.getChoiceList(group.getCollections());

    expect(result).toMatchSnapshot();
  });
});
