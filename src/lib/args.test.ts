jest.mock('yargs', () => ({
  usage: jest.fn().mockReturnThis(),
  group: jest.fn().mockReturnThis(),
  options: jest.fn().mockReturnThis(),
  help: jest.fn().mockReturnThis(),
  version: jest.fn().mockReturnThis(),
  parse: jest.fn().mockReturnThis(),
}));

import yargs from 'yargs';

import args from './args';

/**
 *
 */
describe('Check the args() function', () => {
  /**
   *
   */
  test('it should be faultless when args() is called', () => {
    (yargs.parse as jest.Mock).mockReturnValueOnce({ p: 'path', d: 'filename', c: true });

    const expected = args();

    expect(expected).toEqual({ p: 'path', d: 'filename', c: true });

    expect(yargs.usage).toHaveBeenCalledTimes(1);
    expect(yargs.usage).toHaveBeenCalledWith(expect.any(String), expect.any(String));

    expect(yargs.group).toHaveBeenCalledTimes(1);
    expect(yargs.group).toHaveBeenCalledWith(['p', 'd', 'c'], expect.any(String));

    expect(yargs.options).toHaveBeenCalledTimes(1);
    expect(yargs.options).toHaveBeenCalledWith({
      p: { type: 'string', alias: expect.any(String), description: expect.any(String) },
      d: { type: 'string', alias: expect.any(String), description: expect.any(String) },
      c: { type: 'boolean', alias: expect.any(String), description: expect.any(String) },
    });

    expect(yargs.help).toHaveBeenCalledTimes(1);
    expect(yargs.help).toHaveBeenCalledWith(true);

    expect(yargs.version).toHaveBeenCalledTimes(1);
    expect(yargs.version).toHaveBeenCalledWith();

    expect(yargs.parse).toHaveBeenCalledTimes(1);
    expect(yargs.parse).toHaveBeenCalledWith();
  });
});
