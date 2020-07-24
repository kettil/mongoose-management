import { dirname, join } from 'path';

import { Options } from 'prettier';

import Prompts from '../prompts';
import Converter from './converter';
import File from './handlers/file';
import Template from './handlers/template';
import { exists } from './helper';

import {
  dataCollectionType,
  dataColumnType,
  dataGroupType,
  schemaType,
  templateCollectionNamesType,
  templateCollectionType,
} from '../types';

/**
 *
 */
export default class Create {
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
  async exec(group: dataGroupType) {
    const spinner = this.prompts.getSpinner();
    const path = join(this.pathProject, group.path.replace(/(^\/|\/$|^\\|\\$)/g, ''));
    const file = new File(this.pathTemplates, path);
    const template = new Template(file, this.prettier);

    // Checks whether the collection group folder exists (without group name).
    await exists(dirname(path));

    const data = group.collections
      .filter((collection) => collection.columns.length > 0)
      .map((collection) => this.getCollectionDataset(collection, group));

    try {
      spinner.start('Folders are created');
      await file.createFolders();
      spinner.succeed();

      spinner.start('Documents are created');
      await template.createCollections(data);
      spinner.succeed();

      spinner.start('Static files are created');
      await template.createIndex(data, group.multipleConnection);
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
  getCollectionDataset(
    collection: dataCollectionType,
    { multipleConnection, idType }: dataGroupType,
  ): templateCollectionType {
    const columns: dataColumnType[] = collection.columns;

    this.extendColumnsWithId(columns, collection.idType ?? idType);

    return {
      ...this.createCollectionNames(collection.name),
      schemaDefinitions: this.converter.getDefinitions(columns),
      SchemaIndexes: this.converter.getIndexes(collection.indexes),
      schemaTypes: this.converter.getTypes(columns.filter((column) => column.name !== '_id')),
      additionalImports: this.converter.getImports(columns),
      withMultipleConnection: multipleConnection,
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

  extendColumnsWithId(columns: dataColumnType[], idType: schemaType) {
    const idColumnValues = {
      name: '_id',
      type: idType,
      required: true,
    };

    switch (idType) {
      case 'uuidv4':
        columns.unshift({
          ...idColumnValues,
          default: 'uuidv4',
        });
        break;

      case 'objectId':
        columns.unshift({
          ...idColumnValues,
        });
        break;

      default:
      // do nothing
    }

    columns.forEach((column) => {
      if (column.subColumns) {
        this.extendColumnsWithId(column.subColumns, idType);
      }
    });
  }
}
