import AbstractConverter from './abstract';

import { dataColumnType } from '../../types';

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

    const type = column.subTypes.reduceRight(
      (p, t) =>
        t === 'arrayType' ? `[${p}]` : this.converter.converterCommon.columnToDefinitions({ ...column, type: t }),
      '',
    );

    return `[${type}]`;
  }

  /**
   *
   */
  columnToVirtuals() {
    return '';
  }
}
