import { schemaTypes } from '../../mongo';
import AbstractConverter from './abstract';

import { dataColumnArrayType } from '../../types';

/**
 *
 */
export default class ConverterArrayType extends AbstractConverter<dataColumnArrayType> {
  /**
   *
   * @param column
   */
  columnToTypes(column: dataColumnArrayType): string {
    if (column.type === 'arrayType' && column.subType) {
      return `${this.columnToTypes(column.subType)}[]`;
    }

    return schemaTypes[column.type].type;
  }

  /**
   *
   * @param column
   */
  columnToDefinitions(column: dataColumnArrayType, firstRun = true) {
    const value: string =
      column.type === 'arrayType' && column.subType
        ? `[${this.columnToDefinitions(column.subType, false)}]`
        : schemaTypes[column.type].definition;

    return firstRun ? `{ type: ${value} }` : value;
  }

  /**
   *
   */
  columnToVirtuals() {
    return '';
  }
}
