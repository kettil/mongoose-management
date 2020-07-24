jest.mock('fs');
jest.mock('inquirer');
jest.mock('ora');

import { readFile, writeFile } from 'fs';

import { prompt } from 'inquirer';
import ora from 'ora';

import GroupsDataset from './cli/dataset/groups';
import Prompts from './prompts';

import Storage from './storage';

const mockSpinneFail = jest.fn();
const mockSpinneStart = jest.fn();
const mockSpinneSucceed = jest.fn();

/**
 *
 */
describe('Check the Storage class', () => {
  beforeAll(() => {
    ((ora as any) as jest.Mock).mockReturnValue({
      fail: mockSpinneFail,
      start: mockSpinneStart,
      succeed: mockSpinneSucceed,
    });
  });

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
  });

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
  });

  test('it should be return data object when load() is called', async () => {
    ((readFile as any) as jest.Mock).mockImplementation((_1, _2, cb) => {
      cb(undefined, JSON.stringify({ groups: [{ path: 'path/to/group', collections: [] }] }));
    });

    const prompts = new Prompts();
    const prettier = {};

    const storage = new Storage('path/to/projects', undefined, prompts, prettier);

    const data = await storage.load();

    expect(data).toBeInstanceOf(GroupsDataset);
    expect(data.getObject()).toEqual({
      groups: [{ collections: [], path: 'path/to/group', idType: 'objectId', multipleConnection: false }],
    });

    expect(readFile).toHaveBeenCalledTimes(1);
    expect(readFile).toHaveBeenCalledWith(
      'path/to/projects/schemas-mongodb.json',
      {
        encoding: 'utf8',
      },
      expect.any(Function),
    );

    expect(mockSpinneStart).toHaveBeenCalledTimes(1);
    expect(mockSpinneStart).toHaveBeenCalledWith(expect.any(String));
    expect(mockSpinneFail).toHaveBeenCalledTimes(0);
    expect(mockSpinneSucceed).toHaveBeenCalledTimes(1);
    expect(mockSpinneStart).toHaveBeenCalledWith(expect.any(String));
  });

  test('it should be return data object when load() is called with a unknwon file', async () => {
    ((readFile as any) as jest.Mock).mockImplementation((_1, _2, cb) => {
      const err = new Error('Not Found');

      (err as any).code = 'ENOENT';

      cb(err);
    });

    const prompts = new Prompts();
    const prettier = {};

    const storage = new Storage('path/to/projects', 'path/to/data.json', prompts, prettier);

    const data = await storage.load();

    expect(data).toBeInstanceOf(GroupsDataset);
    expect(data.getObject()).toEqual({ groups: [] });

    expect(readFile).toHaveBeenCalledTimes(1);
    expect(readFile).toHaveBeenCalledWith(
      'path/to/data.json',
      {
        encoding: 'utf8',
      },
      expect.any(Function),
    );

    expect(mockSpinneStart).toHaveBeenCalledTimes(1);
    expect(mockSpinneStart).toHaveBeenCalledWith(expect.any(String));
    expect(mockSpinneFail).toHaveBeenCalledTimes(0);
    expect(mockSpinneSucceed).toHaveBeenCalledTimes(1);
    expect(mockSpinneStart).toHaveBeenCalledWith(expect.any(String));
  });

  test('it should be return data object when load() is called with a unknown read error', async () => {
    ((readFile as any) as jest.Mock).mockImplementation((_1, _2, cb) => {
      cb(new Error('read error'));
    });

    const prompts = new Prompts();
    const prettier = {};

    const storage = new Storage('path/to/projects', undefined, prompts, prettier);

    expect.assertions(8);
    try {
      await storage.load();
    } catch (err) {
      expect(err).toBeInstanceOf(Error);
      expect(err.message).toBe('read error');

      expect(readFile).toHaveBeenCalledTimes(1);
      expect(readFile).toHaveBeenCalledWith(
        'path/to/projects/schemas-mongodb.json',
        {
          encoding: 'utf8',
        },
        expect.any(Function),
      );

      expect(mockSpinneStart).toHaveBeenCalledTimes(1);
      expect(mockSpinneStart).toHaveBeenCalledWith(expect.any(String));
      expect(mockSpinneFail).toHaveBeenCalledTimes(1);
      expect(mockSpinneSucceed).toHaveBeenCalledTimes(0);
    }
  });

  test('it should be write data file when write() is called with press key', async () => {
    ((writeFile as any) as jest.Mock).mockImplementation((_1, _2, _3, cb) => {
      cb();
    });

    const prompts = new Prompts();
    const prettier = {};

    const storage = new Storage('path/to/projects', undefined, prompts, prettier);

    await storage.write();

    expect(writeFile).toHaveBeenCalledTimes(1);
    expect(writeFile).toHaveBeenCalledWith(
      'path/to/projects/schemas-mongodb.json',
      '{ "groups": [] }\n',
      { encoding: 'utf8' },
      expect.any(Function),
    );

    expect(mockSpinneStart).toHaveBeenCalledTimes(1);
    expect(mockSpinneStart).toHaveBeenCalledWith(expect.any(String));
    expect(mockSpinneFail).toHaveBeenCalledTimes(0);
    expect(mockSpinneSucceed).toHaveBeenCalledTimes(1);
    expect(mockSpinneStart).toHaveBeenCalledWith(expect.any(String));

    expect(prompt).toHaveBeenCalledTimes(1);
    expect(prompt).toHaveBeenCalledWith([
      {
        filter: expect.any(Function),
        message: 'Press a key',
        name: 'press',
        pageSize: 75,
        prefix: expect.any(String),
        type: 'input',
      },
    ]);
  });

  test('it should be write data file when write() is called without press key', async () => {
    ((writeFile as any) as jest.Mock).mockImplementation((_1, _2, _3, cb) => {
      cb();
    });

    const prompts = new Prompts();
    const prettier = {};

    const storage = new Storage('path/to/projects', 'path/to/data.json', prompts, prettier);

    await storage.write(false);

    expect(writeFile).toHaveBeenCalledTimes(1);
    expect(writeFile).toHaveBeenCalledWith(
      'path/to/data.json',
      '{ "groups": [] }\n',
      { encoding: 'utf8' },
      expect.any(Function),
    );

    expect(mockSpinneStart).toHaveBeenCalledTimes(1);
    expect(mockSpinneStart).toHaveBeenCalledWith(expect.any(String));
    expect(mockSpinneFail).toHaveBeenCalledTimes(0);
    expect(mockSpinneSucceed).toHaveBeenCalledTimes(1);
    expect(mockSpinneStart).toHaveBeenCalledWith(expect.any(String));

    expect(prompt).toHaveBeenCalledTimes(0);
  });

  test('it should be throw a error when write() is called', async () => {
    ((writeFile as any) as jest.Mock).mockImplementation((_1, _2, _3, cb) => {
      cb(new Error('write error'));
    });

    const prompts = new Prompts();
    const prettier = {};

    const storage = new Storage('path/to/projects', 'path/to/data.json', prompts, prettier);

    expect.assertions(9);
    try {
      await storage.write();
    } catch (err) {
      expect(err).toBeInstanceOf(Error);
      expect(err.message).toBe('write error');

      expect(writeFile).toHaveBeenCalledTimes(1);
      expect(writeFile).toHaveBeenCalledWith(
        'path/to/data.json',
        '{ "groups": [] }\n',
        { encoding: 'utf8' },
        expect.any(Function),
      );

      expect(mockSpinneStart).toHaveBeenCalledTimes(1);
      expect(mockSpinneStart).toHaveBeenCalledWith(expect.any(String));
      expect(mockSpinneFail).toHaveBeenCalledTimes(1);
      expect(mockSpinneSucceed).toHaveBeenCalledTimes(0);

      expect(prompt).toHaveBeenCalledTimes(0);
    }
  });
});
