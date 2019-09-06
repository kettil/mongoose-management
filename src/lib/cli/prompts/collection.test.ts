jest.mock('../../prompts');
jest.mock('../dataset/collection');
jest.mock('../dataset/group');
jest.mock('../helper/evaluation');
jest.mock('./collectionMain');

import Prompts from '../../prompts';
import CollectionDataset from '../dataset/collection';
import GroupDataset from '../dataset/group';
import { mergeEvaluation } from '../helper/evaluation';

import * as main from './collectionMain';

import execute from './collection';

/**
 *
 */
describe('Check the prompts collection function', () => {
  /**
   *
   */
  test('it should be return the collection when execute() is called', async () => {
    const prompts = new (Prompts as any)();
    const group = new (CollectionDataset as any)();
    const collection = new (GroupDataset as any)();

    const mainEvaluation = jest.fn();

    (main.call as jest.Mock).mockResolvedValue({ name: 'collectionName' });
    (main.evaluation as jest.Mock).mockReturnValue(mainEvaluation);
    (mergeEvaluation as jest.Mock).mockReturnValue(collection);

    const result = await execute(prompts, group, collection);

    expect(result).toBe(collection);

    expect(main.call).toHaveBeenCalledTimes(1);
    expect(main.call).toHaveBeenCalledWith(prompts, group, collection);
    expect(main.evaluation).toHaveBeenCalledTimes(1);
    expect(main.evaluation).toHaveBeenCalledWith({ name: 'collectionName' }, group);

    expect(mergeEvaluation).toHaveBeenCalledTimes(1);
    expect(mergeEvaluation).toHaveBeenCalledWith(mainEvaluation, [], collection);
  });
});
