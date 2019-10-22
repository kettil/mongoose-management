import { join, resolve } from 'path';

import { Options, resolveConfig } from 'prettier';

import args from './args';
import Prompts from './prompts';
import Storage from './storage';

import Create from './template/create';
import { exists } from './template/helper';

import GroupsLevel from './cli/level/groups';

export const app = async () => {
  const { p: path, d: dataFilename, c: notClear } = args();

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
  const groups = await storage.load();

  const creater = new Create(prompts, pathProject, join(__dirname, 'template/templates'), prettierOptions);

  const handler = new GroupsLevel(groups, { prompts, storage, creater });
  await handler.exec();
};

export default app;
