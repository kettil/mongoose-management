import AbstractConverter from './abstract';

import { dataColumnType } from '../../types';

/**
 *
 */
export default class ConverterObjrect extends AbstractConverter<dataColumnType[]> {
  /**
   *
   * @param column
   */
  columnToTypes(columns: dataColumnType[]) {
    return this.switchers(columns, 'columnToTypes');
  }

  /**
   *
   * @param column
   */
  columnToDefinitions(columns: dataColumnType[]) {
    return this.switchers(columns, 'columnToDefinitions');
  }

  /**
   *
   * @param columns
   */
  columnToVirtuals(columns: dataColumnType[]) {
    return this.switchers(columns, 'columnToVirtuals');
  }

  /**
   *
   * @param columns
   * @param funcs
   */
  switchers(columns: dataColumnType[], funcs: keyof AbstractConverter<any>) {
    const items = columns.map<[string, string, string]>((column) => [
      column.name,
      this.switcher(column, funcs).trim(),
      funcs === 'columnToTypes' && !column.required ? '?' : '',
    ]);

    return `{ ${items
      .filter((v) => v[1] !== '')
      .map(([k, v, r]) => `'${k}'${r}: ${v}`)
      .join(', ')} }`;
  }

  /**
   *
   * @param column
   * @param funcs
   */
  switcher(column: dataColumnType, funcs: keyof AbstractConverter<any>): string {
    switch (column.type) {
      case '2dsphere':
        return this.converter.converter2dSphere[funcs]();

      case 'arrayType':
        if (!column.subTypes) {
          throw new Error('SubType is not defined!');
        }

        return this.converter.converterArrayType[funcs](column.subTypes);

      case 'array':
        return this.converter.converterArray[funcs](column);

      case 'object':
        if (!column.subColumns) {
          throw new Error('SubColumns are not defined!');
        }

        return this.converter.converterObject[funcs](column.subColumns);

      default:
        return this.converter.converterCommon[funcs](column);
    }
  }
}
