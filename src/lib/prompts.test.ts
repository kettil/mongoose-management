/* tslint:disable:no-console */
jest.spyOn(console, 'log').mockImplementation();
jest.spyOn(process, 'exit').mockImplementation();
jest.spyOn(process.stdout, 'write').mockImplementation();

jest.mock('inquirer');
jest.mock('ora');

import chalk from 'chalk';
import { prompt, registerPrompt } from 'inquirer';
import inquirerFuzzyPath from 'inquirer-fuzzy-path';
import ora from 'ora';

import Prompts, { promptTableOptions, regexpName, regexpNameMessage } from './prompts';

/**
 *
 */
describe('Check the static variables', () => {
  /**
   *
   */
  test.each(['a', 'b_c', 'userLogs'])('checks the name RegExp successfully ["%s"]', (value) => {
    const result = regexpName.test(value);
    expect(result).toBe(true);
  });

  /**
   *
   */
  test.each(['_a', 'Users', 'users_', 'users.logs', '0_logs'])('checks the name RegExp incorrectly ["%s"]', (value) => {
    const result = regexpName.test(value);
    expect(result).toBe(false);
  });

  /**
   *
   */
  test('checks the regexpNameMessage', () => {
    expect(regexpNameMessage).toEqual(expect.any(String));
  });

  /**
   *
   */
  test('checks the prompt table options', () => {
    const drawHorizontalLine = promptTableOptions.drawHorizontalLine;

    expect(promptTableOptions).toEqual({
      border: {
        bodyJoin: chalk.dim('|'),
        bodyLeft: chalk.dim('|'),
        bodyRight: chalk.dim('|'),
        bottomBody: '─',
        bottomJoin: '┴',
        bottomLeft: '└',
        bottomRight: '┘',
        joinBody: '─',
        joinJoin: '┼',
        joinLeft: '├',
        joinRight: '┤',
        topBody: '─',
        topJoin: '┬',
        topLeft: '┌',
        topRight: '┐',
      },
      drawHorizontalLine: expect.any(Function),
    });

    expect(drawHorizontalLine).not.toBeUndefined();
    expect(drawHorizontalLine && drawHorizontalLine(0, 0)).toBe(false);
  });
});

/**
 *
 */
describe('Check the Prompts class', () => {
  /**
   *
   */
  test('initialize the class without arguments', () => {
    const prompts = new Prompts();
    expect(prompts).toBeInstanceOf(Prompts);

    expect(registerPrompt).toHaveBeenCalledTimes(1);
    expect(registerPrompt).toHaveBeenCalledWith('fuzzypath', inquirerFuzzyPath);

    // Checked the protected class variables
    expect((prompts as any).clearScreen).toBe(true);
    expect((prompts as any).options).toEqual({
      pageSize: expect.any(Number),
      prefix: expect.any(String),
      filter: expect.any(Function),
    });
  });

  /**
   *
   */
  test('initialize the class with clearScreen is false', () => {
    const prompts = new Prompts(false);
    expect(prompts).toBeInstanceOf(Prompts);

    expect(registerPrompt).toHaveBeenCalledTimes(1);
    expect(registerPrompt).toHaveBeenCalledWith('fuzzypath', inquirerFuzzyPath);

    // Checked the protected class variables
    expect((prompts as any).clearScreen).toBe(false);
    expect((prompts as any).options).toEqual({
      pageSize: expect.any(Number),
      prefix: expect.any(String),
      filter: expect.any(Function),
    });
  });

  /**
   *
   */
  describe('Check the options.filter() function', () => {
    /**
     *
     */
    test('it should be return trimmed text when the filter() is called with a string value', () => {
      const prompts = new Prompts();

      const expected = (prompts as any).options.filter(' value ');

      expect(expected).toBe('value');
    });

    /**
     *
     */
    test('it should be return equal object when the filter() is called with a object value', () => {
      const value = { a: 42 };

      const prompts = new Prompts();

      const expected = (prompts as any).options.filter(value);

      expect(expected).toBe(value);
      expect(expected).toEqual({ a: 42 });
    });
  });

  /**
   *
   */
  describe('Check the class functions', () => {
    let prompts: Prompts;

    /**
     *
     */
    beforeEach(() => {
      prompts = new Prompts();
    });

    /**
     *
     */
    test('it should be exit the process when exit() is called with confirmation', async () => {
      ((prompt as any) as jest.Mock).mockResolvedValueOnce({ confirm: true });

      await prompts.exit();

      expect(prompt).toHaveBeenCalledTimes(1);
      expect(prompt).toHaveBeenCalledWith([
        {
          default: false,
          filter: expect.any(Function),
          message: expect.any(String),
          name: 'confirm',
          pageSize: expect.any(Number),
          prefix: expect.any(String),
          type: 'confirm',
        },
      ]);

      expect(console.log).toHaveBeenCalledTimes(3);
      expect(console.log).toHaveBeenNthCalledWith(1);
      expect(console.log).toHaveBeenNthCalledWith(2, chalk.bold('Bye Bye 🖖'));
      expect(console.log).toHaveBeenNthCalledWith(3);

      expect(process.exit).toHaveBeenCalledTimes(1);
    });

    /**
     *
     */
    test('it should be not exit the process when exit() is called without confirmation', async () => {
      ((prompt as any) as jest.Mock).mockResolvedValueOnce({ confirm: false });

      await prompts.exit();

      expect(prompt).toHaveBeenCalledTimes(1);
      expect(prompt).toHaveBeenCalledWith([
        {
          default: false,
          filter: expect.any(Function),
          message: expect.any(String),
          name: 'confirm',
          pageSize: expect.any(Number),
          prefix: expect.any(String),
          type: 'confirm',
        },
      ]);

      expect(console.log).toHaveBeenCalledTimes(0);
      expect(process.exit).toHaveBeenCalledTimes(0);
    });

    /**
     *
     */
    test('it should be clear the screen when clear() is called with clearScreen is true', async () => {
      await prompts.clear();

      expect(process.stdout.write).toHaveBeenCalledTimes(2);
      expect(process.stdout.write).toHaveBeenNthCalledWith(1, '\x1b[2J');
      expect(process.stdout.write).toHaveBeenNthCalledWith(2, '\x1b[0f');
    });

    /**
     *
     */
    test('it should be not clear the screen when clear() is called with clearScreen is false', async () => {
      const prompts2 = new Prompts(false);

      await prompts2.clear();

      expect(process.stdout.write).toHaveBeenCalledTimes(0);
    });

    /**
     *
     */
    test.each([[true, true], [false, false]])(
      'it should be return %p when retry() is called and the input value is %p',
      async (expected, value) => {
        ((prompt as any) as jest.Mock).mockResolvedValueOnce({ retry: value });

        const result = await prompts.retry('test message');

        expect(result).toBe(expected);

        expect(prompt).toHaveBeenCalledTimes(1);
        expect(prompt).toHaveBeenCalledWith([
          {
            default: false,
            filter: expect.any(Function),
            message: expect.any(String),
            name: 'retry',
            pageSize: expect.any(Number),
            prefix: expect.any(String),
            type: 'confirm',
          },
        ]);

        expect(console.log).toHaveBeenCalledTimes(2);
        expect(console.log).toHaveBeenNthCalledWith(1, `${chalk.red('>>')} Error!`);
        expect(console.log).toHaveBeenNthCalledWith(2, `${chalk.red('>>')} test message`);
      },
    );

    /**
     *
     */
    test.each([[true, true], [false, false]])(
      'it should be return %p when remove() is called and the input value is %p',
      async (expected, value) => {
        ((prompt as any) as jest.Mock).mockResolvedValueOnce({ remove: value });

        const result = await prompts.remove();

        expect(result).toBe(expected);

        expect(prompt).toHaveBeenCalledTimes(1);
        expect(prompt).toHaveBeenCalledWith([
          {
            default: false,
            filter: expect.any(Function),
            message: expect.any(String),
            name: 'remove',
            pageSize: expect.any(Number),
            prefix: expect.any(String),
            type: 'confirm',
          },
        ]);
      },
    );

    /**
     *
     */
    test('it should be show the message when pressKey() is called with without text', async () => {
      await prompts.pressKey();

      expect(prompt).toHaveBeenCalledTimes(1);
      expect(prompt).toHaveBeenCalledWith([
        {
          filter: expect.any(Function),
          message: expect.any(String),
          name: 'press',
          pageSize: expect.any(Number),
          prefix: expect.any(String),
          type: 'input',
        },
      ]);

      expect(console.log).toHaveBeenCalledTimes(0);
    });

    /**
     *
     */
    test('it should be show the message when pressKey() is called with one line of text', async () => {
      ((prompt as any) as jest.Mock).mockResolvedValueOnce({});

      await prompts.pressKey('test message');

      expect(prompt).toHaveBeenCalledTimes(1);
      expect(prompt).toHaveBeenCalledWith([
        {
          filter: expect.any(Function),
          message: expect.any(String),
          name: 'press',
          pageSize: expect.any(Number),
          prefix: expect.any(String),
          type: 'input',
        },
      ]);

      expect(console.log).toHaveBeenCalledTimes(1);
      expect(console.log).toHaveBeenNthCalledWith(1, `${chalk.green('>>')} test message`);
    });

    /**
     *
     */
    test('it should be show the message when pressKey() is called with several lines of text', async () => {
      ((prompt as any) as jest.Mock).mockResolvedValueOnce({});

      await prompts.pressKey(['test message 1', 'test message 2']);

      expect(prompt).toHaveBeenCalledTimes(1);
      expect(prompt).toHaveBeenCalledWith([
        {
          filter: expect.any(Function),
          message: expect.any(String),
          name: 'press',
          pageSize: expect.any(Number),
          prefix: expect.any(String),
          type: 'input',
        },
      ]);

      expect(console.log).toHaveBeenCalledTimes(2);
      expect(console.log).toHaveBeenNthCalledWith(1, `${chalk.green('>>')} test message 1`);
      expect(console.log).toHaveBeenNthCalledWith(2, `${chalk.green('>>')} test message 2`);
    });

    /**
     *
     */
    test('it should be show the message when pressKey() is called with several lines of text and with error flag', async () => {
      ((prompt as any) as jest.Mock).mockResolvedValueOnce({});

      await prompts.pressKey(['test message 1', 'test message 2'], true);

      expect(prompt).toHaveBeenCalledTimes(1);
      expect(prompt).toHaveBeenCalledWith([
        {
          filter: expect.any(Function),
          message: expect.any(String),
          name: 'press',
          pageSize: expect.any(Number),
          prefix: expect.any(String),
          type: 'input',
        },
      ]);

      expect(console.log).toHaveBeenCalledTimes(3);
      expect(console.log).toHaveBeenNthCalledWith(1, `${chalk.red('>>')} Error!`);
      expect(console.log).toHaveBeenNthCalledWith(2, `${chalk.red('>>')} test message 1`);
      expect(console.log).toHaveBeenNthCalledWith(3, `${chalk.red('>>')} test message 2`);
    });

    /**
     *
     */
    test('it should be return the result when call() is called', async () => {
      ((prompt as any) as jest.Mock).mockResolvedValueOnce({ a: true, b: '42' });

      const result = await prompts.call([
        { type: 'confirm', name: 'a', message: 'Press a key 1' },
        { type: 'input', name: 'b', message: 'Press a key 2' },
      ]);

      expect(result).toEqual({ a: true, b: '42' });

      expect(prompt).toHaveBeenCalledTimes(1);
      expect(prompt).toHaveBeenCalledWith([
        {
          filter: expect.any(Function),
          message: expect.any(String),
          name: 'a',
          pageSize: expect.any(Number),
          prefix: expect.any(String),
          type: 'confirm',
        },
        {
          filter: expect.any(Function),
          message: expect.any(String),
          name: 'b',
          pageSize: expect.any(Number),
          prefix: expect.any(String),
          type: 'input',
        },
      ]);
    });

    /**
     *
     */
    test('it should be return the result when menu() is called', async () => {
      ((prompt as any) as jest.Mock).mockResolvedValueOnce({ value: 'p2' });

      const result = await prompts.menu('questions', [
        { name: 'point 1', short: 'point 1', value: 'p1' },
        { name: 'point 2', short: 'point 2', value: 'p2' },
      ]);

      expect(result).toEqual('p2');

      expect(prompt).toHaveBeenCalledTimes(1);
      expect(prompt).toHaveBeenCalledWith([
        {
          filter: expect.any(Function),
          message: 'questions',
          name: 'value',
          pageSize: expect.any(Number),
          prefix: expect.any(String),
          type: 'list',
          choices: [
            {
              name: 'point 1',
              short: 'point 1',
              value: 'p1',
            },
            {
              name: 'point 2',
              short: 'point 2',
              value: 'p2',
            },
          ],
        },
      ]);
    });

    /**
     *
     */
    test('it should be return a ora instance when getSpinner() is called', async () => {
      const d = { ora: 'instance' };

      ((ora as any) as jest.Mock).mockReturnValue(d);

      const result = prompts.getSpinner();

      expect(result).toBe(d);
      expect(result).toEqual({ ora: 'instance' });

      expect(ora).toHaveBeenCalledTimes(1);
      expect(ora).toHaveBeenCalledWith({ prefixText: chalk.green('>>') });
    });
  });
});
