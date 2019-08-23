jest.mock('../../prompts');

import Prompts from '../../prompts';

import Collection from './collection';

import { Separator } from 'inquirer';

/**
 *
 */
describe('Check the Collection class', () => {
  let collection: Collection;

  /**
   *
   */
  beforeEach(() => {
    (Prompts as jest.Mock).mockClear();

    collection = new Collection(new Prompts());
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

  test('it should be return menu items when getMenuItems() is called', () => {
    //
  });
});
