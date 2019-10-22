jest.mock('../../prompts');
jest.mock('../dataset/collection');
jest.mock('../dataset/column');
jest.mock('../helper/evaluation');
jest.mock('./columnIndex');
jest.mock('./columnMain');
jest.mock('./columnOptions');
jest.mock('./columnSubType');

import Prompts from '../../prompts';
import CollectionDataset from '../dataset/collection';
import ColumnDataset from '../dataset/column';
import { mergeEvaluation } from '../helper/evaluation';

import * as cIndex from './columnIndex';
import * as cMain from './columnMain';
import * as cOptions from './columnOptions';
import * as cSubType from './columnSubType';

import execute from './column';

describe('Check the prompts column function', () => {
  test('it should be return the column when execute() is called with collection', async () => {
    const prompts = new (Prompts as any)();
    const parent = new (CollectionDataset as any)();
    const column = new (ColumnDataset as any)();

    const mainEvaluation = jest.fn();
    const cSubTypeEvaluation = jest.fn();
    const cOptionsEvaluation = jest.fn();
    const cIndexEvaluation = jest.fn();

    (cMain.call as jest.Mock).mockResolvedValue({ name: 'columnName', type: 'arrayType' });
    (cMain.evaluation as jest.Mock).mockReturnValue(mainEvaluation);
    (cSubType.call as jest.Mock).mockResolvedValue(['arrayType', 'date']);
    (cSubType.evaluation as jest.Mock).mockReturnValue(cSubTypeEvaluation);
    (cOptions.call as jest.Mock).mockResolvedValue({ options: ['required', 'default'], default: '[[Date.now()]]' });
    (cOptions.evaluation as jest.Mock).mockReturnValue(cOptionsEvaluation);
    (cIndex.call as jest.Mock).mockResolvedValue({ type: 'unique', value: 'hashed' });
    (cIndex.evaluation as jest.Mock).mockReturnValue(cIndexEvaluation);
    (mergeEvaluation as jest.Mock).mockReturnValue(column);

    const result = await execute(prompts, parent, column);

    expect(result).toBe(column);

    expect(cMain.call).toHaveBeenCalledTimes(1);
    expect(cMain.call).toHaveBeenCalledWith(prompts, parent, column);
    expect(cMain.evaluation).toHaveBeenCalledTimes(1);
    expect(cMain.evaluation).toHaveBeenCalledWith({ name: 'columnName', type: 'arrayType' }, parent, parent);

    expect(cSubType.call).toHaveBeenCalledTimes(1);
    expect(cSubType.call).toHaveBeenCalledWith(prompts, { name: 'columnName', type: 'arrayType' }, column);
    expect(cSubType.evaluation).toHaveBeenCalledTimes(1);
    expect(cSubType.evaluation).toHaveBeenCalledWith(['arrayType', 'date']);

    expect(cOptions.call).toHaveBeenCalledTimes(1);
    expect(cOptions.call).toHaveBeenCalledWith(prompts, column);
    expect(cOptions.evaluation).toHaveBeenCalledTimes(1);
    expect(cOptions.evaluation).toHaveBeenCalledWith({ options: ['required', 'default'], default: '[[Date.now()]]' });

    expect(cIndex.call).toHaveBeenCalledTimes(1);
    expect(cIndex.call).toHaveBeenCalledWith(prompts, { name: 'columnName', type: 'arrayType' }, column);
    expect(cIndex.evaluation).toHaveBeenCalledTimes(1);
    expect(cIndex.evaluation).toHaveBeenCalledWith({ type: 'unique', value: 'hashed' }, parent);

    expect(mergeEvaluation).toHaveBeenCalledTimes(1);
    expect(mergeEvaluation).toHaveBeenCalledWith(
      mainEvaluation,
      [cSubTypeEvaluation, cOptionsEvaluation, cIndexEvaluation],
      column,
    );
  });

  test('it should be return the column when execute() is called with column', async () => {
    const prompts = new (Prompts as any)();
    const collection = new (CollectionDataset as any)();
    const parent = new (ColumnDataset as any)();
    const column = new (ColumnDataset as any)();

    const mainEvaluation = jest.fn();
    const cSubTypeEvaluation = jest.fn();
    const cOptionsEvaluation = jest.fn();
    const cIndexEvaluation = jest.fn();

    (parent.getCollection as jest.Mock).mockReturnValue(collection);

    (cMain.call as jest.Mock).mockResolvedValue({ name: 'columnName', type: 'arrayType' });
    (cMain.evaluation as jest.Mock).mockReturnValue(mainEvaluation);
    (cSubType.call as jest.Mock).mockResolvedValue(['arrayType', 'date']);
    (cSubType.evaluation as jest.Mock).mockReturnValue(cSubTypeEvaluation);
    (cOptions.call as jest.Mock).mockResolvedValue({ options: ['required', 'default'], default: '[[Date.now()]]' });
    (cOptions.evaluation as jest.Mock).mockReturnValue(cOptionsEvaluation);
    (cIndex.call as jest.Mock).mockResolvedValue({ type: 'unique', value: 'hashed' });
    (cIndex.evaluation as jest.Mock).mockReturnValue(cIndexEvaluation);
    (mergeEvaluation as jest.Mock).mockReturnValue(column);

    const result = await execute(prompts, parent, column);

    expect(result).toBe(column);

    expect(cMain.call).toHaveBeenCalledTimes(1);
    expect(cMain.call).toHaveBeenCalledWith(prompts, parent, column);
    expect(cMain.evaluation).toHaveBeenCalledTimes(1);
    expect(cMain.evaluation).toHaveBeenCalledWith({ name: 'columnName', type: 'arrayType' }, parent, collection);

    expect(cSubType.call).toHaveBeenCalledTimes(1);
    expect(cSubType.call).toHaveBeenCalledWith(prompts, { name: 'columnName', type: 'arrayType' }, column);
    expect(cSubType.evaluation).toHaveBeenCalledTimes(1);
    expect(cSubType.evaluation).toHaveBeenCalledWith(['arrayType', 'date']);

    expect(cOptions.call).toHaveBeenCalledTimes(1);
    expect(cOptions.call).toHaveBeenCalledWith(prompts, column);
    expect(cOptions.evaluation).toHaveBeenCalledTimes(1);
    expect(cOptions.evaluation).toHaveBeenCalledWith({ options: ['required', 'default'], default: '[[Date.now()]]' });

    expect(cIndex.call).toHaveBeenCalledTimes(1);
    expect(cIndex.call).toHaveBeenCalledWith(prompts, { name: 'columnName', type: 'arrayType' }, column);
    expect(cIndex.evaluation).toHaveBeenCalledTimes(1);
    expect(cIndex.evaluation).toHaveBeenCalledWith({ type: 'unique', value: 'hashed' }, collection);

    expect(mergeEvaluation).toHaveBeenCalledTimes(1);
    expect(mergeEvaluation).toHaveBeenCalledWith(
      mainEvaluation,
      [cSubTypeEvaluation, cOptionsEvaluation, cIndexEvaluation],
      column,
    );
  });
});
