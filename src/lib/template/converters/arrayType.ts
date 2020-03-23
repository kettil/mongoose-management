import AbstractConverter from './abstract';

import { dataColumnType } from '../../types';
import ConverterCommon from './common';
import ConverterUUIDv4 from './uuidv4';

/**
 *
 */
export default class ConverterArrayType extends AbstractConverter<dataColumnType> {
  /**
   *
   * @param columns
   */
  columnToTypes(column: dataColumnType): string {
    if (!Array.isArray(column.subTypes)) {
      throw new Error('SubType is not defined!');
    }

    const type = column.subTypes.reduceRight(
      (p, t) => (t === 'arrayType' ? `${p}[]` : this.converter.converterCommon.columnToTypes({ ...column, type: t })),
      '',
    );

    return `${type}[]`;
  }

  /**
   *
   * @param columns
   */
  columnToDefinitions(column: dataColumnType): string {
    if (!Array.isArray(column.subTypes)) {
      throw new Error('SubType is not defined!');
    }

    const type = column.subTypes.reduceRight((p, t) => {
      let converter: ConverterCommon | ConverterUUIDv4;
      switch (t) {
        case 'arrayType':
          return `[${p}]`;
        case 'uuidv4':
          converter = this.converter.converterUUIDv4;
          break;
        default:
          converter = this.converter.converterCommon;
      }

      return converter.columnToDefinitions({ ...column, type: t });
    }, '');

    return `[${type}]`;
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
