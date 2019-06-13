import fs from 'fs';
import { resolve } from 'path';
import { promisify } from 'util';

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

const copy = promisify(fs.copyFile);
const mkdir = promisify(fs.mkdir);
const access = promisify(fs.access);

const exists = (path: string) => access(path, fs.constants.F_OK);
const readable = (path: string) => access(path, fs.constants.R_OK);
const writable = (path: string) => access(path, fs.constants.F_OK | fs.constants.W_OK);

export default class File {
  protected readonly encoding = 'utf8';

  protected subFolderDocuments = 'documents';
  protected subFolderInterfaces = 'interfaces';
  protected subFolderModels = 'models';
  protected subFolderRepositories = 'repositories';

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
      await writable(this.pathDestination);
    } catch (e) {
      await writable(resolve(this.pathDestination, '..'));
      await mkdir(this.pathDestination);
    }

    const subFolders = [
      this.subFolderDocuments,
      this.subFolderInterfaces,
      this.subFolderModels,
      this.subFolderRepositories,
    ];

    await Promise.all(subFolders.map((name) => mkdir(resolve(this.pathDestination, name))));
  }

  /**
   *
   * @param name
   * @param data
   */
  async writeDocument(name: string, data: String) {
    await this.write(this.subFolderDocuments, name, data);
  }

  /**
   *
   * @param name
   * @param data
   */
  async writeInterface(name: string, data: String) {
    await this.write(this.subFolderInterfaces, name, data);
  }

  /**
   *
   * @param name
   * @param data
   */
  async writeModel(name: string, data: String) {
    await this.write(this.subFolderModels, name, data);
  }

  /**
   *
   * @param name
   * @param data
   */
  async writeRepository(name: string, data: String) {
    await this.write(this.subFolderRepositories, name, data);
  }

  /**
   *
   * @param folder
   * @param name
   * @param data
   */
  protected async write(folder: string, name: string, data: String) {
    await writable(resolve(this.pathDestination, folder));
    await writeFile(resolve(this.pathDestination, folder, name), data, { encoding: this.encoding });
  }
}
