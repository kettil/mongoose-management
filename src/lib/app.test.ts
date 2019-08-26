jest.mock('path');

jest.mock('prettier');

jest.mock('./args', () => ({ __esModule: true, default: jest.fn() }));
jest.mock('./storage');
jest.mock('./prompts');

jest.mock('./cli/sequences/collection');
jest.mock('./cli/sequences/collections');
jest.mock('./cli/sequences/column');
jest.mock('./cli/sequences/groups');
jest.mock('./cli/sequences/index');
jest.mock('./cli/actions/collection');
jest.mock('./cli/actions/column');
jest.mock('./cli/actions/group');
jest.mock('./cli/actions/index');

jest.mock('./template/create');
jest.mock('./template/helper');

import { join, resolve } from 'path';

import { resolveConfig } from 'prettier';

import args from './args';
import Prompts from './prompts';
import Storage from './storage';

import Collection from './cli/sequences/collection';
import Collections from './cli/sequences/collections';
import Column from './cli/sequences/column';
import Groups from './cli/sequences/groups';
import Index from './cli/sequences/index';

import CollectionAction from './cli/actions/collection';
import ColumnAction from './cli/actions/column';
import GroupAction from './cli/actions/group';
import IndexAction from './cli/actions/index';

import Create from './template/create';
import { exists } from './template/helper';

import app from './app';

/**
 *
 */
describe('Check the app() function', () => {
  /**
   *
   */
  test('it should be faultless when app() is called with default vaules', async () => {
    const data = { groups: [{ path: 'path/to/group', collections: [] }] };
    const prettier = {
      arrowParens: 'always',
      bracketSpacing: true,
      jsxBracketSameLine: false,
      parser: 'cli',
      printWidth: 120,
      semi: true,
      singleQuote: true,
      tabWidth: 2,
      trailingComma: 'all',
      useTabs: false,
    };

    (args as jest.Mock).mockReturnValue({ p: undefined, d: undefined, c: undefined });

    (join as jest.Mock).mockReturnValue('/path/to/templates');
    (resolve as jest.Mock).mockReturnValue('/path/to/root');
    ((resolveConfig as any) as jest.Mock).mockResolvedValue({ parser: 'cli' });

    (Storage.prototype.load as jest.Mock).mockReturnValue(data);

    await app();

    expect(args).toHaveBeenCalledTimes(1);
    expect(resolve).toHaveBeenCalledTimes(1);
    expect(resolve).toHaveBeenCalledWith(expect.any(String), './');
    expect(join).toHaveBeenCalledTimes(1);
    expect(join).toHaveBeenCalledWith(expect.any(String), 'template/templates');
    expect(exists).toHaveBeenCalledTimes(1);
    expect(exists).toHaveBeenCalledWith('/path/to/root');
    expect(resolveConfig).toHaveBeenCalledTimes(1);
    expect(resolveConfig).toHaveBeenCalledWith('/path/to/root');

    expect(Prompts).toHaveBeenCalledTimes(1);
    expect(Prompts).toHaveBeenCalledWith(true);
    expect(Storage).toHaveBeenCalledTimes(1);
    expect(Storage).toHaveBeenCalledWith('/path/to/root', undefined, expect.any(Prompts), prettier);
    expect(Storage.prototype.load).toHaveBeenCalledTimes(1);
    expect(GroupAction).toHaveBeenCalledTimes(1);
    expect(GroupAction).toHaveBeenCalledWith(expect.any(Prompts));
    expect(CollectionAction).toHaveBeenCalledTimes(1);
    expect(CollectionAction).toHaveBeenCalledWith(expect.any(Prompts));
    expect(IndexAction).toHaveBeenCalledTimes(1);
    expect(IndexAction).toHaveBeenCalledWith(expect.any(Prompts));
    expect(ColumnAction).toHaveBeenCalledTimes(1);
    expect(ColumnAction).toHaveBeenCalledWith(expect.any(Prompts), expect.any(IndexAction));
    expect(Create).toHaveBeenCalledTimes(1);
    expect(Create).toHaveBeenCalledWith(expect.any(Prompts), '/path/to/root', '/path/to/templates', prettier);

    expect(Groups).toHaveBeenCalledTimes(1);
    expect(Groups).toHaveBeenCalledWith(data.groups, data, {
      prompts: expect.any(Prompts),
      storage: expect.any(Storage),
      Collections,
      Collection,
      Column,
      Index,

      actionGroup: expect.any(GroupAction),
      actionCollection: expect.any(CollectionAction),
      actionColumn: expect.any(ColumnAction),
      actionIndex: expect.any(IndexAction),

      createTemplate: expect.any(Create),

      data,
    });
    expect(Groups.prototype.exec).toHaveBeenCalledTimes(1);
  });

  /**
   *
   */
  test('it should be faultless when app() is called', async () => {
    const data = { groups: [{ path: 'path/to/group', collections: [] }] };
    const prettier = {
      arrowParens: 'always',
      bracketSpacing: true,
      jsxBracketSameLine: false,
      parser: 'cli2',
      printWidth: 120,
      semi: true,
      singleQuote: true,
      tabWidth: 2,
      trailingComma: 'all',
      useTabs: false,
    };

    (args as jest.Mock).mockReturnValue({ p: 'src', d: './schema.json', c: true });

    (join as jest.Mock).mockReturnValue('/path/to/templates');
    (resolve as jest.Mock).mockReturnValue('/path/to/root');
    ((resolveConfig as any) as jest.Mock).mockResolvedValue({ parser: 'cli2' });

    (Storage.prototype.load as jest.Mock).mockReturnValue(data);

    await app();

    expect(args).toHaveBeenCalledTimes(1);
    expect(resolve).toHaveBeenCalledTimes(1);
    expect(resolve).toHaveBeenCalledWith(expect.any(String), 'src');
    expect(join).toHaveBeenCalledTimes(1);
    expect(join).toHaveBeenCalledWith(expect.any(String), 'template/templates');
    expect(exists).toHaveBeenCalledTimes(1);
    expect(exists).toHaveBeenCalledWith('/path/to/root');
    expect(resolveConfig).toHaveBeenCalledTimes(1);
    expect(resolveConfig).toHaveBeenCalledWith('/path/to/root');

    expect(Prompts).toHaveBeenCalledTimes(1);
    expect(Prompts).toHaveBeenCalledWith(false);
    expect(Storage).toHaveBeenCalledTimes(1);
    expect(Storage).toHaveBeenCalledWith('/path/to/root', './schema.json', expect.any(Prompts), prettier);
    expect(Storage.prototype.load).toHaveBeenCalledTimes(1);
    expect(GroupAction).toHaveBeenCalledTimes(1);
    expect(GroupAction).toHaveBeenCalledWith(expect.any(Prompts));
    expect(CollectionAction).toHaveBeenCalledTimes(1);
    expect(CollectionAction).toHaveBeenCalledWith(expect.any(Prompts));
    expect(IndexAction).toHaveBeenCalledTimes(1);
    expect(IndexAction).toHaveBeenCalledWith(expect.any(Prompts));
    expect(ColumnAction).toHaveBeenCalledTimes(1);
    expect(ColumnAction).toHaveBeenCalledWith(expect.any(Prompts), expect.any(IndexAction));
    expect(Create).toHaveBeenCalledTimes(1);
    expect(Create).toHaveBeenCalledWith(expect.any(Prompts), '/path/to/root', '/path/to/templates', prettier);

    expect(Groups).toHaveBeenCalledTimes(1);
    expect(Groups).toHaveBeenCalledWith(data.groups, data, {
      prompts: expect.any(Prompts),
      storage: expect.any(Storage),
      Collections,
      Collection,
      Column,
      Index,

      actionGroup: expect.any(GroupAction),
      actionCollection: expect.any(CollectionAction),
      actionColumn: expect.any(ColumnAction),
      actionIndex: expect.any(IndexAction),

      createTemplate: expect.any(Create),

      data,
    });
    expect(Groups.prototype.exec).toHaveBeenCalledTimes(1);
  });
});
