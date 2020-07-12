import { render } from 'mustache';
import { format, Options } from 'prettier';

import File from './file';

import { templateCollectionType, templateTypesType } from '../../types';

/**
 *
 */
export default class Template {
  protected readonly overwrite: templateTypesType[] = ['documents', 'models', 'types'];
  protected readonly uniquely: templateTypesType[] = ['repositories', 'hooks'];

  /**
   *
   * @param fileHandler
   */
  constructor(protected fileHandler: File, protected prettier: Options = {}) {}

  /**
   *
   * @param data
   */
  async createIndex(data: templateCollectionType[], withMultipleConnection: boolean) {
    data.sort((a, b) => (a.collectionNameLower < b.collectionNameLower ? -1 : 1));

    let content = await this.fileHandler.read('index');

    content = render(content, { collections: data, withMultipleConnection });
    content = format(content, { ...this.prettier, parser: 'typescript' });

    await this.fileHandler.write('index', 'index', content);
  }

  /**
   *
   * @param data
   */
  async createCollections(data: templateCollectionType[]) {
    await Promise.all(data.map((d) => this.renderCollectionFiles(d)));
  }

  /**
   *
   * @param data
   */
  async renderCollectionFiles(data: templateCollectionType) {
    const promiseOverwrite = this.overwrite.map((name) => this.renderCollectionFile(name, data, true));
    const promiseUniquely = this.uniquely.map((name) => this.renderCollectionFile(name, data, false));

    await Promise.all([...promiseOverwrite, ...promiseUniquely]);
  }

  /**
   *
   * @param name
   * @param data
   * @param withOverwrite
   */
  async renderCollectionFile(name: templateTypesType, data: templateCollectionType, withOverwrite = true) {
    if (!withOverwrite) {
      const exists = await this.fileHandler.exists(name, data.collectionNameLower);

      if (exists) {
        return;
      }
    }

    let content = await this.fileHandler.read(name);

    content = render(content, data);
    content = format(content, { ...this.prettier, parser: 'typescript' });

    await this.fileHandler.write(name, data.collectionNameLower, content);
  }
}
