import { schemaTypes } from '../../mongo';
import AbstractConverter from './abstract';

import { schemaNormalType } from '../../types';

/**
 *
 */
export default class ConverterArrayType extends AbstractConverter<schemaNormalType[]> {
  /**
   *
   * @param columns
   */
  columnToTypes(columns: schemaNormalType[]): string {
    const type = columns.reduceRight((p, c) => (c === 'arrayType' ? `${p}[]` : schemaTypes[c].type), '');

    return `${type}[]`;
  }

  /**
   *
   * @param columns
   */
  columnToDefinitions(columns: schemaNormalType[]): string {
    const type = columns.reduceRight((p, c) => (c === 'arrayType' ? `[${p}]` : schemaTypes[c].definition), '');

    return `{ type: [${type}] }`;
  }

  /**
   *
   */
  columnToVirtuals() {
    return '';
  }
}
