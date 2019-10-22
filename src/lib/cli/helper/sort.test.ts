import { sortByName, sortByPath } from './sort';

describe('Check the sort functions', () => {
  test('it should be return -1 when sortByName() is called with c1 and c2', () => {
    const result = sortByName({ getName: () => 'g1' }, { getName: () => 'g2' });

    expect(result).toEqual(-1);
  });

  test('it should be return 1 when sortByName() is called with c2 and c1', () => {
    const result = sortByName({ getName: () => 'g2' }, { getName: () => 'g1' });

    expect(result).toEqual(1);
  });

  test('it should be return 0 when sortByName() is called with c2 and c2', () => {
    const result = sortByName({ getName: () => 'g2' }, { getName: () => 'g2' });

    expect(result).toEqual(0);
  });

  test('it should be return -1 when sortByPath() is called with g1 and g2', () => {
    const result = sortByPath({ getPath: () => 'g1' }, { getPath: () => 'g2' });

    expect(result).toEqual(-1);
  });

  test('it should be return 1 when sortByPath() is called with g2 and g1', () => {
    const result = sortByPath({ getPath: () => 'g2' }, { getPath: () => 'g1' });

    expect(result).toEqual(1);
  });

  test('it should be return 0 when sortByPath() is called with g2 and g2', () => {
    const result = sortByPath({ getPath: () => 'g2' }, { getPath: () => 'g2' });

    expect(result).toEqual(0);
  });
});
