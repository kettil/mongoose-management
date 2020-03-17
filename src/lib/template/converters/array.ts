import AbstractConverter from './abstract';

import { dataColumnType } from '../../types';

/**
 *
 */
export default class ConverterArray extends AbstractConverter<dataColumnType> {
  /**
   *
   * @param column
   */
  columnToTypes(column: dataColumnType) {
    if (!Array.isArray(column.subColumns)) {
      throw new Error('SubColumns are not defined!');
    }

    return `Array<${this.converter.converterObject.columnToTypes(column.subColumns)}>`;
  }

  /**
   *
   * @param column
   */
  columnToDefinitions(column: dataColumnType) {
    if (!Array.isArray(column.subColumns)) {
      throw new Error('SubColumns are not defined!');
    }

    return `[${this.converter.converterObject.columnToDefinitions(column.subColumns)}]`;
  }

  /**
   *
   */
  columnToVirtuals() {
    return '';
  }

  columnToImports(column: dataColumnType) {
    if (!Array.isArray(column.subColumns)) {
      return [];
    }

    return this.converter.converterObject.columnToImports(column.subColumns);
  }
}
