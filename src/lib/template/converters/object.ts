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
    const items = columns.map<[string, string]>((column) => [column.name, this.switcher(column, funcs).trim()]);

    return `{ ${items
      .filter((v) => v[1] !== '')
      .map(([k, v]) => `'${k}': ${v}`)
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
        break;

      case 'arrayType':
        if (!column.subType) {
          throw new Error('SubType is not defined!');
        }

        return this.converter.converterArrayType[funcs]({ type: column.type, subType: column.subType });
        break;

      case 'array':
        return this.converter.converterArray[funcs](column);
        break;

      case 'object':
        if (!column.subColumns) {
          throw new Error('SubColumns are not defined!');
        }

        return this.converter.converterObject[funcs](column.subColumns);
        break;

      default:
        return this.converter.converterCommon[funcs](column);
        break;
    }
  }
}
