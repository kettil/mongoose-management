jest.spyOn(JSON, 'stringify');
jest.spyOn(JSON, 'parse');

jest.mock('fs');
jest.mock('util');

jest.mock('prettier');

jest.mock('./cli/dataset/groups');
jest.mock('./converter');
jest.mock('./prompts');

import fs from 'fs';
import { promisify } from 'util';

import { format } from 'prettier';

import GroupsDataset from './cli/dataset/groups';
import converter from './converter';
import Prompts from './prompts';

((promisify as any) as jest.Mock).mockImplementation((a) => a);
const mockSpinneFail = jest.fn();
const mockSpinneStart = jest.fn();
const mockSpinneSucceed = jest.fn();

import Storage from './storage';

/**
 *
 */
describe('Check the Storage class', () => {
  /**
   *
   */
  beforeAll(() => {
    (format as jest.Mock).mockReturnValue('beautiful dat string');

    (Prompts.prototype.getSpinner as jest.Mock).mockReturnValue({
      fail: mockSpinneFail,
      start: mockSpinneStart,
      succeed: mockSpinneSucceed,
    });
  });

  /**
   *
   */
  test('initialize the class with pathData', () => {
    const prompts = new Prompts();
    const prettier = {};

    const storage = new Storage('path/to/projects', 'path/to/data', prompts, prettier);

    expect(storage).toBeInstanceOf(Storage);

    // Checked the protected class variables
    expect((storage as any).prompts).toBe(prompts);
    expect((storage as any).prettier).toBe(prettier);
    expect((storage as any).path).toBe('path/to/data');
    expect((storage as any).data).toBeInstanceOf(GroupsDataset);

    expect(GroupsDataset).toHaveBeenCalledTimes(1);
    expect(GroupsDataset).toHaveBeenCalledWith({ groups: [] }, 'path/to/projects');
  });

  /**
   *
   */
  test('initialize the class without pathData', () => {
    const prompts = new Prompts();
    const prettier = {};

    const storage = new Storage('path/to/projects', undefined, prompts, prettier);

    expect(storage).toBeInstanceOf(Storage);

    // Checked the protected class variables
    expect((storage as any).prompts).toBe(prompts);
    expect((storage as any).prettier).toBe(prettier);
    expect((storage as any).path).toBe('path/to/projects/schemas-mongodb.json');
    expect((storage as any).data).toBeInstanceOf(GroupsDataset);

    expect(GroupsDataset).toHaveBeenCalledTimes(1);
    expect(GroupsDataset).toHaveBeenCalledWith({ groups: [] }, 'path/to/projects');
  });

  /**
   *
   */
  test('it should be return data object when load() is called', async () => {
    ((fs.readFile as any) as jest.Mock).mockResolvedValueOnce('{"groups":[{"path":"src/odm"}]}');

    const prompts = new Prompts();
    const prettier = {};

    const storage = new Storage('path/to/projects', undefined, prompts, prettier);

    const data = await storage.load();

    expect(data).toBeInstanceOf(GroupsDataset);

    expect(fs.readFile).toHaveBeenCalledTimes(1);
    expect(fs.readFile).toHaveBeenCalledWith('path/to/projects/schemas-mongodb.json', {
      encoding: 'utf8',
    });

    expect(JSON.parse).toHaveBeenCalledTimes(1);
    expect(JSON.parse).toHaveBeenCalledWith('{"groups":[{"path":"src/odm"}]}');

    expect(prompts.getSpinner).toHaveBeenCalledTimes(1);
    expect(mockSpinneStart).toHaveBeenCalledTimes(1);
    expect(mockSpinneStart).toHaveBeenCalledWith(expect.any(String));
    expect(mockSpinneFail).toHaveBeenCalledTimes(0);
    expect(mockSpinneSucceed).toHaveBeenCalledTimes(1);
    expect(mockSpinneStart).toHaveBeenCalledWith(expect.any(String));

    expect(GroupsDataset).toHaveBeenCalledTimes(2);
    expect(GroupsDataset).toHaveBeenNthCalledWith(1, { groups: [] }, 'path/to/projects');
    expect(GroupsDataset).toHaveBeenNthCalledWith(2, { groups: [{ path: 'src/odm' }] }, 'path/to/projects');

    expect(converter).toHaveBeenCalledTimes(1);
    expect(converter).toHaveBeenCalledWith({ groups: [{ path: 'src/odm' }] });
  });

  /**
   *
   */
  test('it should be return data object when load() is called with a unknwon file', async () => {
    ((fs.readFile as any) as jest.Mock).mockRejectedValueOnce({ code: 'ENOENT' });

    const prompts = new Prompts();
    const prettier = {};

    const storage = new Storage('path/to/projects', 'path/to/data.json', prompts, prettier);

    const data = await storage.load();

    expect(data).toBeInstanceOf(GroupsDataset);

    expect(fs.readFile).toHaveBeenCalledTimes(1);
    expect(fs.readFile).toHaveBeenCalledWith('path/to/data.json', {
      encoding: 'utf8',
    });

    expect(prompts.getSpinner).toHaveBeenCalledTimes(1);
    expect(mockSpinneStart).toHaveBeenCalledTimes(1);
    expect(mockSpinneStart).toHaveBeenCalledWith(expect.any(String));
    expect(mockSpinneFail).toHaveBeenCalledTimes(0);
    expect(mockSpinneSucceed).toHaveBeenCalledTimes(1);
    expect(mockSpinneStart).toHaveBeenCalledWith(expect.any(String));

    expect(GroupsDataset).toHaveBeenCalledTimes(1);
    expect(GroupsDataset).toHaveBeenNthCalledWith(1, { groups: [] }, 'path/to/projects');

    expect(converter).toHaveBeenCalledTimes(0);
  });

  /**
   *
   */
  test('it should be return data object when load() is called with a unknown read error', async () => {
    ((fs.readFile as any) as jest.Mock).mockRejectedValueOnce(new Error('read error'));

    const prompts = new Prompts();
    const prettier = {};

    const storage = new Storage('path/to/projects', undefined, prompts, prettier);

    expect.assertions(11);
    try {
      await storage.load();
    } catch (err) {
      expect(err).toBeInstanceOf(Error);
      expect(err.message).toBe('read error');

      expect(fs.readFile).toHaveBeenCalledTimes(1);
      expect(fs.readFile).toHaveBeenCalledWith('path/to/projects/schemas-mongodb.json', {
        encoding: 'utf8',
      });

      expect(JSON.parse).toHaveBeenCalledTimes(0);

      expect(prompts.getSpinner).toHaveBeenCalledTimes(1);
      expect(mockSpinneStart).toHaveBeenCalledTimes(1);
      expect(mockSpinneStart).toHaveBeenCalledWith(expect.any(String));
      expect(mockSpinneFail).toHaveBeenCalledTimes(1);
      expect(mockSpinneSucceed).toHaveBeenCalledTimes(0);

      expect(converter).toHaveBeenCalledTimes(0);
    }
  });

  /**
   *
   */
  test('it should be write data file when write() is called with press key', async () => {
    (GroupsDataset.prototype.getObject as jest.Mock).mockReturnValue({
      groups: [{ path: 'path/to', collections: [] }],
    });

    const prompts = new Prompts();
    const prettier = {};

    const storage = new Storage('path/to/projects', undefined, prompts, prettier);

    await storage.write();

    expect(prompts.getSpinner).toHaveBeenCalledTimes(1);

    expect(fs.writeFile).toHaveBeenCalledTimes(1);
    expect(fs.writeFile).toHaveBeenCalledWith('path/to/projects/schemas-mongodb.json', 'beautiful dat string', {
      encoding: 'utf8',
    });

    expect(JSON.stringify).toHaveBeenCalledTimes(1);
    expect(JSON.stringify).toHaveBeenCalledWith({
      groups: [{ path: 'path/to', collections: [] }],
    });

    expect(format).toHaveBeenCalledTimes(1);
    expect(format).toHaveBeenCalledWith('{"groups":[{"path":"path/to","collections":[]}]}', { parser: 'json' });

    expect(mockSpinneStart).toHaveBeenCalledTimes(1);
    expect(mockSpinneStart).toHaveBeenCalledWith(expect.any(String));
    expect(mockSpinneFail).toHaveBeenCalledTimes(0);
    expect(mockSpinneSucceed).toHaveBeenCalledTimes(1);
    expect(mockSpinneStart).toHaveBeenCalledWith(expect.any(String));

    expect(prompts.pressKey).toHaveBeenCalledTimes(1);

    expect(GroupsDataset.prototype.getObject).toHaveBeenCalledTimes(1);
  });

  /**
   *
   */
  test('it should be write data file when write() is called without press key', async () => {
    (GroupsDataset.prototype.getObject as jest.Mock).mockReturnValue({
      groups: [{ path: 'path/to', collections: [] }],
    });

    const prompts = new Prompts();
    const prettier = {};

    const storage = new Storage('path/to/projects', 'path/to/data.json', prompts, prettier);

    await storage.write(false);

    expect(fs.writeFile).toHaveBeenCalledTimes(1);
    expect(fs.writeFile).toHaveBeenCalledWith('path/to/data.json', 'beautiful dat string', {
      encoding: 'utf8',
    });

    expect(JSON.stringify).toHaveBeenCalledTimes(1);
    expect(JSON.stringify).toHaveBeenCalledWith({
      groups: [{ path: 'path/to', collections: [] }],
    });

    expect(format).toHaveBeenCalledTimes(1);
    expect(format).toHaveBeenCalledWith('{"groups":[{"path":"path/to","collections":[]}]}', { parser: 'json' });

    expect(prompts.getSpinner).toHaveBeenCalledTimes(1);
    expect(mockSpinneStart).toHaveBeenCalledTimes(1);
    expect(mockSpinneStart).toHaveBeenCalledWith(expect.any(String));
    expect(mockSpinneFail).toHaveBeenCalledTimes(0);
    expect(mockSpinneSucceed).toHaveBeenCalledTimes(1);
    expect(mockSpinneStart).toHaveBeenCalledWith(expect.any(String));

    expect(prompts.pressKey).toHaveBeenCalledTimes(0);
  });

  /**
   *
   */
  test('it should be throw a error when write() is called', async () => {
    ((fs.writeFile as any) as jest.Mock).mockRejectedValueOnce(new Error('write error'));
    (GroupsDataset.prototype.getObject as jest.Mock).mockReturnValue({
      groups: [{ path: 'path/to', collections: [] }],
    });

    const prompts = new Prompts();
    const prettier = {};

    const storage = new Storage('path/to/projects', 'path/to/data.json', prompts, prettier);

    expect.assertions(14);
    try {
      await storage.write();
    } catch (err) {
      expect(err).toBeInstanceOf(Error);
      expect(err.message).toBe('write error');

      expect(fs.writeFile).toHaveBeenCalledTimes(1);
      expect(fs.writeFile).toHaveBeenCalledWith('path/to/data.json', 'beautiful dat string', {
        encoding: 'utf8',
      });

      expect(JSON.stringify).toHaveBeenCalledTimes(1);
      expect(JSON.stringify).toHaveBeenCalledWith({ groups: [{ collections: [], path: 'path/to' }] });

      expect(format).toHaveBeenCalledTimes(1);
      expect(format).toHaveBeenCalledWith('{"groups":[{"path":"path/to","collections":[]}]}', { parser: 'json' });

      expect(prompts.getSpinner).toHaveBeenCalledTimes(1);
      expect(mockSpinneStart).toHaveBeenCalledTimes(1);
      expect(mockSpinneStart).toHaveBeenCalledWith(expect.any(String));
      expect(mockSpinneFail).toHaveBeenCalledTimes(1);
      expect(mockSpinneSucceed).toHaveBeenCalledTimes(0);

      expect(prompts.pressKey).toHaveBeenCalledTimes(0);
    }
  });
});
