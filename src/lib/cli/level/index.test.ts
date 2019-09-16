jest.mock('../../prompts');
jest.mock('../../storage');
jest.mock('../../template/create');
jest.mock('../dataset/index');
jest.mock('../menu/index');
jest.mock('../prompts/index');
jest.mock('./group');

import Prompts from '../../prompts';
import Storage from '../../storage';
import Creater from '../../template/create';

import IndexDataset from '../dataset/index';

import IndexMenu from '../menu/index';

import promptsIndex from '../prompts/index';

import IndexLevel from './index';

import { levelOptionsType } from '../../types';

/**
 *
 */
describe('Check the IndexLevel class', () => {
  let level: any;
  let dataset: any;
  let prompts: any;
  let options: levelOptionsType;

  /**
   *
   */
  beforeEach(() => {
    const storage = new (Storage as any)();
    const creater = new (Creater as any)();
    prompts = new (Prompts as any)();
    dataset = new (IndexDataset as any)();
    options = { prompts, storage, creater };

    level = new IndexLevel(dataset, options);
  });

  /**
   *
   */
  test('initialize the class', () => {
    expect(level).toBeInstanceOf(IndexLevel);

    expect(level.dataset).toBe(dataset);
    expect(level.menu).toBeInstanceOf(IndexMenu);
    expect(level.prompts).toBe(prompts);
    expect(level.options).toBe(options);

    expect(level.promptCreate).toEqual(expect.any(Function));
    expect(level.promptEdit).toEqual(expect.any(Function));

    expect(level.promptEdit).toBe(promptsIndex);
  });

  /**
   *
   */
  test('it should be throw an error when promptCreate() is called', async () => {
    expect.assertions(2);
    try {
      await level.promptCreate();
    } catch (err) {
      expect(err).toBeInstanceOf(Error);
      expect(err.message).toBe('No subindex can be created');
    }
  });
});
