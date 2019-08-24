import { join, resolve } from 'path';

import { Options, resolveConfig } from 'prettier';
import yargs from 'yargs';

import Prompts from './prompts';
import Storage from './storage';
import { exists } from './template/helper';

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

import { cliOptionsType } from './types';

/**
 *
 */
export const app = async () => {
  const { p: path, d: dataFilename, c: notClear } = yargs
    .usage('$0 [-p path/to/project] [-d schemas.json]', 'Mongoose schemas management tool')
    .group(['p', 'd', 'c'], 'Config:')
    .options({
      p: {
        type: 'string',
        alias: 'path',
        description: 'Path to the project folder',
        hidden: false,
      },
      d: {
        type: 'string',
        alias: 'data',
        description: 'File name where the schema data is stored\n(file is saved in project folder)',
      },
      c: {
        type: 'boolean',
        alias: 'not-clear',
        description: 'Clear not the terminal screen',
      },
    })
    .help(true)
    .version()
    .parse();

  const pathProject = resolve(process.cwd(), path || './');

  // Checks whether the project folder exists.
  await exists(pathProject);

  const prettierOptionsFile = await resolveConfig(pathProject);
  const prettierOptions: Options = {
    printWidth: 120,
    tabWidth: 2,
    useTabs: false,
    semi: true,
    singleQuote: true,
    trailingComma: 'all',
    bracketSpacing: true,
    jsxBracketSameLine: false,
    arrowParens: 'always',
    ...prettierOptionsFile,
  };

  const prompts = new Prompts(!notClear);
  const storage = new Storage(pathProject, dataFilename, prompts, prettierOptions);
  const data = await storage.load();

  const actionGroup = new GroupAction(prompts);
  const actionCollection = new CollectionAction(prompts);
  const actionIndex = new IndexAction(prompts);
  const actionColumn = new ColumnAction(prompts, actionIndex);

  const createTemplate = new Create(prompts, pathProject, join(__dirname, 'template/templates'), prettierOptions);

  const opts: cliOptionsType = {
    prompts,
    storage,
    Collections,
    Collection,
    Column,
    Index,

    actionGroup,
    actionCollection,
    actionColumn,
    actionIndex,

    createTemplate,

    data,
  };

  const groups = new Groups(data.groups, data, opts);

  await groups.exec();
};

/**
 *
 */
export default app;
