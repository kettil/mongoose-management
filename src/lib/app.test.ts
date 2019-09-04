jest.mock('path');

jest.mock('prettier');

jest.mock('./args', () => jest.fn());
jest.mock('./prompts');
jest.mock('./storage');

jest.mock('./template/create');
jest.mock('./template/helper');

jest.mock('./cli/dataset/groups');
jest.mock('./cli/level/groups');

import { join, resolve } from 'path';

import { resolveConfig } from 'prettier';

import args from './args';
import Prompts from './prompts';
import Storage from './storage';

import Creater from './template/create';
import { exists } from './template/helper';

import GroupsDataset from './cli/dataset/groups';
import GroupsLevel from './cli/level/groups';

import app from './app';

/**
 *
 */
describe('Check the app() function', () => {
  /**
   *
   */
  test('it should be faultless when app() is called with default vaules', async () => {
    const groupsDataset = new (GroupsDataset as any)();
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

    (Storage.prototype.load as jest.Mock).mockResolvedValue(groupsDataset);

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
    expect(Creater).toHaveBeenCalledTimes(1);
    expect(Creater).toHaveBeenCalledWith(expect.any(Prompts), '/path/to/root', '/path/to/templates', prettier);

    expect(GroupsLevel).toHaveBeenCalledTimes(1);
    expect(GroupsLevel).toHaveBeenCalledWith(groupsDataset, {
      prompts: (Prompts as jest.Mock).mock.instances[0],
      storage: (Storage as jest.Mock).mock.instances[0],
      creater: (Creater as jest.Mock).mock.instances[0],
    });
    expect(GroupsLevel.prototype.exec).toHaveBeenCalledTimes(1);
  });

  /**
   *
   */
  test('it should be faultless when app() is called', async () => {
    const groupsDataset = new (GroupsDataset as any)();
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

    (args as jest.Mock).mockReturnValue({ p: 'src', d: './schema.json', c: true });

    (join as jest.Mock).mockReturnValue('/path/to/templates');
    (resolve as jest.Mock).mockReturnValue('/path/to/root');
    ((resolveConfig as any) as jest.Mock).mockResolvedValue({ parser: 'cli' });

    (Storage.prototype.load as jest.Mock).mockReturnValue(groupsDataset);

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
    expect(Creater).toHaveBeenCalledTimes(1);
    expect(Creater).toHaveBeenCalledWith(expect.any(Prompts), '/path/to/root', '/path/to/templates', prettier);

    expect(GroupsLevel).toHaveBeenCalledTimes(1);
    expect(GroupsLevel).toHaveBeenCalledWith(groupsDataset, {
      prompts: (Prompts as jest.Mock).mock.instances[0],
      storage: (Storage as jest.Mock).mock.instances[0],
      creater: (Creater as jest.Mock).mock.instances[0],
    });
    expect(GroupsLevel.prototype.exec).toHaveBeenCalledTimes(1);
  });
});
