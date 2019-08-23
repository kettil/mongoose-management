import { groupMainEvaluation, groupMainQuestions } from './groupMain';

import { dataGroupType } from '../../types';

/**
 *
 */
describe('Check the groupMain functions', () => {
  /**
   *
   */
  describe('Check the groupMainQuestions()', () => {
    const datasetGroups: Array<[string, any[]]> = [
      ['0', []],
      ['2', [{ path: 'path/to/one', collections: [] }, { path: 'path/to/two', collections: [] }]],
    ];

    /**
     *
     */
    test.each(datasetGroups)(
      'it should be return choices when the function is called with %s group(s) ',
      (_, groups) => {
        const result = groupMainQuestions(groups);

        expect(result).toEqual([
          {
            excludePath: expect.any(Function),
            itemType: 'directory',
            message: 'Target path for the group:',
            name: 'path',
            rootPath: '.',
            suggestOnly: false,
            type: 'fuzzypath',
          },
          {
            default: 'odm',
            message: 'Collection group name:',
            name: 'name',
            type: 'input',
            validate: expect.any(Function),
          },
        ]);
      },
    );

    /**
     *
     */
    test('it should be return true when validate() is called with correct values (from "name" question)', () => {
      const groups = [{ path: 'path/to/one', collections: [] }, { path: 'path/to/two', collections: [] }];

      const questions = groupMainQuestions(groups).filter((q) => q.name === 'name');
      expect(questions.length).toBe(1);

      const validate = questions[0].validate;
      expect(typeof validate).toBe('function');

      const result = validate('three', { path: 'path/to' });

      expect(result).toBe(true);
    });

    /**
     *
     */
    test('it should be return a error message when validate() is called with duplicate path (from "name" question)', () => {
      const groups = [{ path: 'path/to/one', collections: [] }, { path: 'path/to/two', collections: [] }];

      const questions = groupMainQuestions(groups).filter((q) => q.name === 'name');
      expect(questions.length).toBe(1);

      const validate = questions[0].validate;
      expect(typeof validate).toBe('function');

      const result = validate('one', { path: 'path/to' });

      expect(result).toEqual('The path and the name already exist as a group [group: path/to/one]!');
    });

    /**
     *
     */
    test('it should be return a error message when validate() is called with wrong name (from "name" question)', () => {
      const groups = [{ path: 'path/to/one', collections: [] }, { path: 'path/to/two', collections: [] }];

      const questions = groupMainQuestions(groups).filter((q) => q.name === 'name');
      expect(questions.length).toBe(1);

      const validate = questions[0].validate;
      expect(typeof validate).toBe('function');

      const result = validate('_odm', { path: 'path/to' });

      expect(result).toEqual(
        'Only letters, numbers and hyphens are allowed and the first character must be a small letter! (RegExp: ^[a-z](?:[a-zA-Z0-9_-]*[a-zA-Z0-9])?$|^$)',
      );
    });

    const datasetExcludePath = [
      [false, 'src/lib'],
      [false, '.'],
      [true, 'node_modules/path'],
      [true, '.git'],
      [true, 'src/.odm'],
    ];

    /**
     *
     */
    test.each(datasetExcludePath)(
      'it should be return %p when excludePath() is called with values "%s" (from "path" question)',
      (expected, path) => {
        const questions = groupMainQuestions([]).filter((q) => q.name === 'path');
        expect(questions.length).toBe(1);

        const excludePath = questions[0].excludePath;
        expect(typeof excludePath).toBe('function');

        const result = excludePath(path);

        expect(result).toBe(expected);
      },
    );
  });

  /**
   *
   */
  describe('Check the groupMainEvaluation()', () => {
    /**
     *
     */
    test('it should be create column object when the function is called without group', () => {
      const result = groupMainEvaluation(undefined, { name: 'odm', path: 'path/to/' });

      expect(result).toEqual({ path: 'path/to/odm', collections: [] });
    });

    /**
     *
     */
    test('it should be update column object when the function is called with group', () => {
      const group: dataGroupType = { path: 'path/to/first', collections: [] };

      const result = groupMainEvaluation(group, { name: 'odm', path: 'path/to/other' });

      expect(result).toBe(group);
      expect(result.path).toBe('path/to/other/odm');
    });
  });
});
