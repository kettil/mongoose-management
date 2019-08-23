import { join, resolve } from 'path';

import { Options } from 'prettier';

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
export const app = async ({ p, d }: { p?: string; d?: string }) => {
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
  };

  const pathProject = resolve(process.cwd(), p || './');

  // Checks whether the project folder exists.
  await exists(pathProject);

  const prompts = new Prompts();
  const storage = new Storage(pathProject, d, prompts, prettierOptions);
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
