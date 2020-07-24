import { schemaTypes } from '../../mongo';
import AbstractConverter from './abstract';

import { dataColumnType } from '../../types';

/**
 *
 */
export default class ConverterCommon extends AbstractConverter<dataColumnType> {
  /**
   *
   * @param column
   */
  columnToTypes(column: dataColumnType) {
    return `${schemaTypes[column.type].type}`;
  }

  /**
   *
   * @param column
   */
  columnToDefinitions(column: dataColumnType) {
    const items = [
      `type: ${schemaTypes[column.type].definition}`,

      this.getTypeString(column, 'required'),
      this.getTypeString(column, 'default'),
      this.getTypeString(column, 'lowercase'),
      this.getTypeString(column, 'uppercase'),
      this.getTypeString(column, 'trim'),
      this.getTypeString(column, 'match'),
      this.getTypeString(column, 'enum'),
      this.getTypeString(column, 'minLength'),
      this.getTypeString(column, 'maxLength'),
      this.getTypeString(column, 'min'),
      this.getTypeString(column, 'max'),
      this.getTypeString(column, 'populate'),
    ];

    return `{ ${items.filter((s) => s.trim() !== '').join(', ')} }`;
  }

  /**
   *
   */
  columnToVirtuals() {
    return '';
  }

  /**
   *
   * @param column
   * @param type
   */
  getTypeString(column: dataColumnType, type: keyof dataColumnType) {
    const value = column[type];

    switch (true) {
      case ['populate'].indexOf(type) >= 0:
        if (typeof value === 'string') {
          return `ref: '${value.substr(0, 1).toUpperCase() + value.substr(1)}'`;
        }
        break;

      case ['enum'].indexOf(type) >= 0:
        if (typeof value === 'string' && value !== '') {
          const values = value
            .split(';')
            .map((s) => `'${s.trim()}'`)
            .join(',');

          return `${type}: [ ${values} ]`;
        }
        break;

      case ['match'].indexOf(type) >= 0:
        if (typeof value === 'string' && value !== '') {
          return `${type}: new RegExp('${value}')`;
        }
        break;

      case ['required', 'lowercase', 'uppercase', 'trim'].indexOf(type) >= 0:
        if (typeof value === 'boolean') {
          return `${type}: ${value ? 'true' : 'false'}`;
        }
        break;

      case ['default', 'minLength', 'maxLength', 'min', 'max'].indexOf(type) >= 0:
        if (['number', 'string'].indexOf(typeof value) >= 0) {
          return `${type}: ${value}`;
        }
        break;

      default:
        if (typeof value === 'string') {
          return `${type}: '${value}'`;
        }
    }

    return '';
  }

  columnToImports(value: dataColumnType) {
    return [];
  }
}
