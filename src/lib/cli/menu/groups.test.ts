jest.mock('../../prompts');

import Prompts from '../../prompts';
import GroupsDataset from '../dataset/groups';

import GroupsMenu from './groups';

import { choicesType } from '../../types';

describe('Check the GroupsMenu class', () => {
  let groups: GroupsDataset;
  let prompts: any;
  let menu: any;

  beforeEach(() => {
    groups = new GroupsDataset(
      {
        groups: [
          {
            path: 'path',
            collections: [],
          },
        ],
      },
      jest.fn() as any,
    );
    groups.setReference();

    prompts = new Prompts();

    menu = new GroupsMenu(prompts);
  });

  test('initialize the class', () => {
    expect(menu).toBeInstanceOf(GroupsMenu);

    expect(menu.prompts).toBe(prompts);
  });

  test('it should be return menu selection when exec() is called with groups', async () => {
    ((prompts.menu as any) as jest.Mock).mockImplementation((_: string, choices: choicesType<any>[]) => {
      expect(choices).toMatchSnapshot();

      return { action: 'create', data: undefined };
    });

    const result = await menu.exec(groups);

    expect(result).toEqual({ action: 'create', data: undefined });
    expect(prompts.menu).toHaveBeenCalledTimes(1);
    expect(prompts.menu).toHaveBeenCalledWith('Choose a group or a command:', expect.any(Array));
  });

  test('it should be return menu selection when exec() is called without groups', async () => {
    ((prompts.menu as any) as jest.Mock).mockImplementation((_: string, choices: choicesType<any>[]) => {
      expect(choices).toMatchSnapshot();

      return { action: 'create', data: undefined };
    });

    groups.getGroups().forEach((g) => g.remove());

    const result = await menu.exec(groups);

    expect(result).toEqual({ action: 'create', data: undefined });
    expect(prompts.menu).toHaveBeenCalledTimes(1);
    expect(prompts.menu).toHaveBeenCalledWith('Choose a group or a command:', expect.any(Array));
  });

  test('it should be return adjusted groups when getChoiceList() is called', () => {
    const result = menu.getChoiceList(groups.getGroups());

    expect(result).toMatchSnapshot();
  });
});
