jest.spyOn(console, 'log').mockImplementation();
jest.spyOn(process, 'exit').mockImplementation(() => {
  throw { notice: 'process.exit()' };
});

jest.mock('fs');
jest.mock('inquirer');
jest.mock('prettier');
jest.mock('ora');

import { access, readFile } from 'fs';
import { prompt, Separator } from 'inquirer';
import ora from 'ora';
import { resolveConfig } from 'prettier';

import app from './app';

describe('Check the app() function', () => {
  test('it should be faultless when app() is called with default vaules', async () => {
    ((ora as any) as jest.Mock).mockReturnValueOnce({ start: jest.fn(), fail: jest.fn(), succeed: jest.fn() });
    ((prompt as any) as jest.Mock).mockResolvedValueOnce({ value: { action: 'exit' } });
    ((prompt as any) as jest.Mock).mockResolvedValueOnce({ confirm: true });
    ((resolveConfig as any) as jest.Mock).mockResolvedValue({});
    ((access as any) as jest.Mock).mockImplementation((_1, _2, cb) => cb());
    ((readFile as any) as jest.Mock).mockImplementation((_1, _2, cb) => {
      const err = new Error('Not Found');
      (err as any).code = 'ENOENT';

      cb(err);
    });

    try {
      await app();
    } catch (err) {
      expect(err).toEqual({ notice: 'process.exit()' });

      expect(access).toHaveBeenCalledTimes(1);
      expect(access).toHaveBeenCalledWith(expect.any(String), 0, expect.any(Function));
      expect(readFile).toHaveBeenCalledTimes(1);
      expect(readFile).toHaveBeenCalledWith(expect.any(String), { encoding: 'utf8' }, expect.any(Function));
      expect(resolveConfig).toHaveBeenCalledTimes(1);
      expect(resolveConfig).toHaveBeenCalledWith(expect.any(String));

      expect(prompt).toHaveBeenCalledTimes(2);
      expect(prompt).toHaveBeenNthCalledWith(1, [
        {
          choices: [
            expect.any(Separator),
            expect.any(Separator),
            expect.any(Separator),
            expect.any(Separator),
            expect.any(Separator),
            { name: 'Create new group', short: expect.any(String), value: { action: 'create' } },
            { name: 'Save', short: expect.any(String), value: { action: 'save' } },
            { name: 'Exit', short: expect.any(String), value: { action: 'exit' } },
            expect.any(Separator),
          ],
          filter: expect.any(Function),
          message: 'Choose a group or a command:',
          name: 'value',
          pageSize: 75,
          prefix: expect.any(String),
          type: 'list',
        },
      ]);
      expect(prompt).toHaveBeenNthCalledWith(2, [
        {
          default: false,
          filter: expect.any(Function),
          message: 'Generator really quit?',
          name: 'confirm',
          pageSize: 75,
          prefix: expect.any(String),
          type: 'confirm',
        },
      ]);
    }
  });
});
