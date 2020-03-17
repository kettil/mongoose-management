import { dirname, join } from 'path';

import { Options } from 'prettier';

import Prompts from '../prompts';
import Converter from './converter';
import File from './handlers/file';
import Template from './handlers/template';
import { exists } from './helper';

import { dataCollectionType, templateCollectionNamesType, templateCollectionType } from '../types';

/**
 *
 */
export default class Create {
  protected interfaceName = 'Interface';

  /**
   *
   * @param prompts
   * @param pathProject
   * @param pathTemplates
   * @param prettier
   * @param converter
   */
  constructor(
    protected prompts: Prompts,
    protected pathProject: string,
    protected pathTemplates: string,
    protected prettier: Options,
    protected converter = new Converter(),
  ) {}

  /**
   *
   * @param source
   * @param collections
   */
  async exec(destination: string, collections: dataCollectionType[]) {
    const spinner = this.prompts.getSpinner();
    const path = join(this.pathProject, destination.replace(/(^\/|\/$|^\\|\\$)/g, ''));
    const file = new File(this.pathTemplates, path);
    const template = new Template(file, this.prettier);

    // Checks whether the collection group folder exists (without group name).
    await exists(dirname(path));

    const data = collections
      .filter((collection) => collection.columns.length > 0)
      .map((collection) => this.getCollectionDataset(collection));

    try {
      spinner.start('Folders are created');
      await file.createFolders();
      spinner.succeed();

      spinner.start('Documents are created');
      await template.createCollections(data);
      spinner.succeed();

      spinner.start('Static files are created');
      await template.createIndex(data);
      await file.copyStaticFiles();
      spinner.succeed();
    } catch (err) {
      spinner.fail();
      throw err;
    }

    await this.prompts.pressKey();
  }

  /**
   *
   * @param collection
   */
  getCollectionDataset(collection: dataCollectionType): templateCollectionType {
    return {
      ...this.createCollectionNames(collection.name),
      interfaceName: this.interfaceName,
      schemaDefinitions: this.converter.getDefinitions(collection.columns),
      SchemaIndexes: this.converter.getIndexes(collection.indexes),
      schemaTypes: this.converter.getTypes(collection.columns),
      additionalImports: this.converter.getImports(collection.columns),
    };
  }

  /**
   *
   * @param name
   */
  createCollectionNames(name: string): templateCollectionNamesType {
    const uFirst = (item: string) => item.substr(0, 1).toUpperCase() + item.substr(1);
    const items = name.split(/[^a-z0-9]/i);

    const nameLower = items.slice(0, 1).concat(items.slice(1).map(uFirst));
    const nameUpper = items.map(uFirst);

    return {
      collectionNameRaw: name,
      collectionNameLower: nameLower.join(''),
      collectionNameUpper: nameUpper.join(''),
    };
  }
}
