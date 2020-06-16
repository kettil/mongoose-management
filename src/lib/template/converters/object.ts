import AbstractConverter from './abstract';

import { dataColumnType } from '../../types';

/**
 *
 */
export default class ConverterObject extends AbstractConverter<dataColumnType[]> {
  /**
   *
   * @param column
   */
  columnToTypes(columns: dataColumnType[]) {
    if (columns.length === 0) {
      return this.converter.converterCommon.columnToTypes({ name: '', type: 'object' });
    }

    return this.switchers(columns, 'columnToTypes');
  }

  /**
   *
   * @param column
   */
  columnToDefinitions(columns: dataColumnType[]) {
    if (columns.length === 0) {
      return this.converter.converterCommon.columnToDefinitions({ name: '', type: 'object' });
    }

    return this.switchers(columns, 'columnToDefinitions');
  }

  columnToImports(columns: dataColumnType[]) {
    if (columns.length === 0) {
      return [];
    }

    return (
      columns
        .map((column) => {
          const switcher = this.switcher(column, 'columnToImports');
          if (typeof switcher === 'string') {
            return [switcher];
          }

          return switcher;
        })
        // following is the same as .flat(), but that does not exist in node 10
        .reduce((acc, val) => acc.concat(val), [])
    );
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
    const items = columns.map<[string, string | string[], string]>((column) => {
      let switchers = this.switcher(column, funcs);
      if (typeof switchers === 'string') {
        switchers = switchers.trim();
      } else {
        switchers.map((value) => value.trim());
      }

      return [column.name, switchers, funcs === 'columnToTypes' && !column.required ? '?' : ''];
    });

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
  switcher(column: dataColumnType, funcs: keyof AbstractConverter<any>): string | string[] {
    switch (column.type) {
      case '2dsphere':
        return this.converter.converter2dSphere[funcs]();

      case 'uuidv4':
        return this.converter.converterUUIDv4[funcs](column);

      case 'arrayType':
        return this.converter.converterArrayType[funcs](column);

      case 'array':
        return this.converter.converterArray[funcs](column);

      case 'object':
        if (!Array.isArray(column.subColumns)) {
          throw new Error('SubColumns are not defined!');
        }

        return this.converter.converterObject[funcs](column.subColumns);

      default:
        return this.converter.converterCommon[funcs](column);
    }
  }
}
