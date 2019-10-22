jest.mock('../../prompts');
jest.mock('../dataset/collection');
jest.mock('../dataset/index');
jest.mock('../helper/evaluation');
jest.mock('./indexColumns');
jest.mock('./indexMain');
jest.mock('./indexOptions');

import Prompts from '../../prompts';
import CollectionDataset from '../dataset/collection';
import IndexDataset from '../dataset/index';
import { mergeEvaluation } from '../helper/evaluation';

import * as cColumns from './indexColumns';
import * as cMain from './indexMain';
import * as cOptions from './indexOptions';

import execute from './index';

describe('Check the prompts index function', () => {
  test('it should be return the index when execute() is called with collection', async () => {
    const prompts = new (Prompts as any)();
    const collection = new (CollectionDataset as any)();
    const index = new (IndexDataset as any)();

    const mainEvaluation = jest.fn();
    const cColumnsEvaluation = jest.fn();
    const cOptionsEvaluation = jest.fn();

    (cMain.call as jest.Mock).mockResolvedValue({ name: 'indexName', columns: ['c1', 'c2'] });
    (cMain.evaluation as jest.Mock).mockReturnValue(mainEvaluation);
    (cColumns.call as jest.Mock).mockResolvedValue({ c1: 1, c2: -1 });
    (cColumns.evaluation as jest.Mock).mockReturnValue(cColumnsEvaluation);
    (cOptions.call as jest.Mock).mockResolvedValue({ unique: true, sparse: true });
    (cOptions.evaluation as jest.Mock).mockReturnValue(cOptionsEvaluation);
    (mergeEvaluation as jest.Mock).mockReturnValue(index);

    const result = await execute(prompts, collection, index);

    expect(result).toBe(index);

    expect(cMain.call).toHaveBeenCalledTimes(1);
    expect(cMain.call).toHaveBeenCalledWith(prompts, collection, index);
    expect(cMain.evaluation).toHaveBeenCalledTimes(1);
    expect(cMain.evaluation).toHaveBeenCalledWith({ name: 'indexName', columns: ['c1', 'c2'] }, collection);

    expect(cColumns.call).toHaveBeenCalledTimes(1);
    expect(cColumns.call).toHaveBeenCalledWith(
      prompts,
      { name: 'indexName', columns: ['c1', 'c2'] },
      collection,
      index,
    );
    expect(cColumns.evaluation).toHaveBeenCalledTimes(1);
    expect(cColumns.evaluation).toHaveBeenCalledWith({ c1: 1, c2: -1 });

    expect(cOptions.call).toHaveBeenCalledTimes(1);
    expect(cOptions.call).toHaveBeenCalledWith(prompts, index);
    expect(cOptions.evaluation).toHaveBeenCalledTimes(1);
    expect(cOptions.evaluation).toHaveBeenCalledWith({ unique: true, sparse: true });

    expect(mergeEvaluation).toHaveBeenCalledTimes(1);
    expect(mergeEvaluation).toHaveBeenCalledWith(mainEvaluation, [cColumnsEvaluation, cOptionsEvaluation], index);
  });
});
