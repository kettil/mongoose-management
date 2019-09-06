jest.mock('../../prompts');
jest.mock('../dataset/group');
jest.mock('../dataset/groups');
jest.mock('../helper/evaluation');
jest.mock('./groupMain');

import Prompts from '../../prompts';
import GroupDataset from '../dataset/group';
import GroupsDataset from '../dataset/groups';
import { mergeEvaluation } from '../helper/evaluation';

import * as main from './groupMain';

import execute from './group';

/**
 *
 */
describe('Check the prompts group function', () => {
  /**
   *
   */
  test('it should be return the group when execute() is called', async () => {
    const prompts = new (Prompts as any)();
    const groups = new (GroupDataset as any)();
    const group = new (GroupsDataset as any)();

    const mainEvaluation = jest.fn();

    (main.call as jest.Mock).mockResolvedValue({ name: 'groupName', path: 'path/to/folder' });
    (main.evaluation as jest.Mock).mockReturnValue(mainEvaluation);
    (mergeEvaluation as jest.Mock).mockReturnValue(group);

    const result = await execute(prompts, groups);

    expect(result).toBe(group);

    expect(main.call).toHaveBeenCalledTimes(1);
    expect(main.call).toHaveBeenCalledWith(prompts, groups);
    expect(main.evaluation).toHaveBeenCalledTimes(1);
    expect(main.evaluation).toHaveBeenCalledWith({ name: 'groupName', path: 'path/to/folder' }, groups);

    expect(mergeEvaluation).toHaveBeenCalledTimes(1);
    expect(mergeEvaluation).toHaveBeenCalledWith(mainEvaluation);
  });
});
