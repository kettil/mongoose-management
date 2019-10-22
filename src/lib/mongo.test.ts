import { indexColumnValues, schemaIndexTypes, schemaTypes, schemaTypesNormal, schemaTypesSpecial } from './mongo';

describe('Check the mongo functions', () => {
  test('Snapshot of indexColumnValues', () => {
    expect(indexColumnValues).toMatchSnapshot();
  });

  test('Snapshot of schemaIndexTypes', () => {
    expect(schemaIndexTypes).toMatchSnapshot();
  });

  test('Snapshot of schemaTypes', () => {
    expect(schemaTypes).toMatchSnapshot();
  });

  test('Snapshot of schemaTypesNormal', () => {
    expect(schemaTypesNormal).toMatchSnapshot();
  });

  test('Snapshot of schemaTypesSpecial', () => {
    expect(schemaTypesSpecial).toMatchSnapshot();
  });
});
