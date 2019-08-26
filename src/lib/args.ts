import yargs from 'yargs';

/**
 *
 */
export const args = () =>
  yargs
    .usage('$0 [-p path/to/project] [-d schemas.json]', 'Mongoose schemas management tool')
    .group(['p', 'd', 'c'], 'Config:')
    .options({
      p: {
        type: 'string',
        alias: 'path',
        description: 'Path to the project folder',
      },
      d: {
        type: 'string',
        alias: 'data',
        description: 'File name where the schema data is stored\n(file is saved in project folder)',
      },
      c: {
        type: 'boolean',
        alias: 'not-clear',
        description: 'Clear not the terminal screen',
      },
    })
    .help(true)
    .version()
    .parse();

/**
 *
 */
export default args;
