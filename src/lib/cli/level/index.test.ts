import IndexDataset from '../dataset/index';
import IndexMenu from '../menu/index';

import promptsIndex from '../prompts/index';

import IndexLevel from './index';

describe('Check the IndexLevel class', () => {
  let prompts: any;
  let storage: any;
  let creater: any;
  let dataset: IndexDataset;
  let level: any;

  beforeEach(() => {
    prompts = jest.fn();
    storage = jest.fn();
    creater = jest.fn();

    dataset = new IndexDataset({ name: 'i1', columns: { c1: 1 }, properties: {} }, jest.fn() as any);
    level = new IndexLevel(dataset, { prompts, storage, creater });
  });

  test('initialize the class', () => {
    expect(level).toBeInstanceOf(IndexLevel);

    expect(level.dataset).toBeInstanceOf(IndexDataset);
    expect(level.menu).toBeInstanceOf(IndexMenu);
    expect(level.prompts).toBe(prompts);
    expect(level.options).toEqual({ prompts, storage, creater });

    expect(level.promptCreate).toEqual(expect.any(Function));
    expect(level.promptEdit).toBe(promptsIndex);
  });

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
