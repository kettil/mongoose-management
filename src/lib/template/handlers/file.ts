import { resolve } from 'path';

import { copy, exists, mkdir, readFile, writable, writeFile } from '../helper';

import { templateTypesType } from '../../types';

/**
 *
 */
export default class File {
  protected readonly encoding = 'utf8';

  protected readonly fileAccess = 0o755;
  protected readonly folderAccess = 0o755;

  protected readonly types: { [k in templateTypesType]: { path: string; template: string } } = {
    index: { path: '', template: 'index' },
    documents: { path: 'documents', template: 'document' },
    middlewares: { path: 'middlewares', template: 'middleware' },
    models: { path: 'models', template: 'model' },
    repositories: { path: 'repositories', template: 'repository' },
    types: { path: 'types', template: 'type' },
  };

  protected readonly staticFiles = ['helper.ts', 'types.ts', 'uuidHelpers.ts'];

  /**
   *
   * @param pathSource
   * @param pathDestination
   */
  constructor(protected pathSource: string, protected pathDestination: string) {}

  /**
   *
   */
  async createFolders() {
    try {
      await exists(this.pathDestination);
    } catch (err1) {
      await writable(resolve(this.pathDestination, '..'));
      await mkdir(this.pathDestination, { mode: this.folderAccess });
    }

    await writable(this.pathDestination);

    await Promise.all(
      Object.entries(this.types)
        .filter(([, { path }]) => path !== '')
        .map(([, { path }]) =>
          mkdir(resolve(this.pathDestination, path), { recursive: true, mode: this.folderAccess }),
        ),
    );
  }

  /**
   *
   */
  async copyStaticFiles() {
    await Promise.all(
      this.staticFiles.map((file) =>
        copy(resolve(this.pathSource, 'statics', file), resolve(this.pathDestination, file)),
      ),
    );
  }

  /**
   *
   * @param type
   */
  async read(type: templateTypesType) {
    const template = await readFile(resolve(this.pathSource, `${this.types[type].template}.mst`), {
      encoding: this.encoding,
    });

    return template;
  }

  /**
   *
   * @param folder
   * @param name
   * @param data
   */
  async write(type: templateTypesType, name: string, data: string) {
    const path = resolve(this.pathDestination, this.types[type].path);

    await writable(path);
    await writeFile(resolve(path, `${name}.ts`), data, {
      encoding: this.encoding,
    });
  }

  /**
   *
   * @param type
   * @param name
   */
  async exists(type: templateTypesType, name: string) {
    try {
      await exists(resolve(this.pathDestination, this.types[type].path, `${name}.ts`));
    } catch (e) {
      // file does not exist
      return false;
    }

    // file exists
    return true;
  }
}
