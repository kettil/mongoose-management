import Converter2dSphere from './converters/2dsphere';
import ConverterArray from './converters/array';
import ConverterArrayType from './converters/arrayType';
import ConverterCommon from './converters/common';
import ConverterObject from './converters/object';
import ConverterUUIDv4 from './converters/uuidv4';

import { dataColumnType, dataIndexType } from '../types';

/**
 *
 */
export default class Converter {
  readonly converter2dSphere: Converter2dSphere;
  readonly converterUUIDv4: ConverterUUIDv4;
  readonly converterArray: ConverterArray;
  readonly converterArrayType: ConverterArrayType;
  readonly converterCommon: ConverterCommon;
  readonly converterObject: ConverterObject;

  constructor() {
    this.converter2dSphere = new Converter2dSphere(this);
    this.converterUUIDv4 = new ConverterUUIDv4(this);
    this.converterArray = new ConverterArray(this);
    this.converterArrayType = new ConverterArrayType(this);
    this.converterCommon = new ConverterCommon(this);
    this.converterObject = new ConverterObject(this);
  }

  /**
   *
   * @param columns
   */
  getDefinitions(columns: dataColumnType[]): string {
    return this.converterObject.columnToDefinitions(columns);
  }

  /**
   *
   * @param columns
   */
  getTypes(columns: dataColumnType[]): string {
    return this.converterObject.columnToTypes(columns);
  }

  getVirtuals(columns: dataColumnType[]): string {
    return '';
  }

  getImports(columns: dataColumnType[]): string[] {
    const columnImports = this.converterObject.columnToImports(columns);

    return columnImports.filter((value, index) => columnImports.indexOf(value) === index).sort();
  }

  /**
   *
   */
  getIndexes(indexes: dataIndexType[]): string {
    return `[${indexes.map((index) => this.convertIndex(index)).join(', ')}]`;
  }

  /**
   *
   * @param index
   */
  convertIndex(index: dataIndexType): string {
    const fields = Object.entries(index.columns).map(this.convertIndexField);
    const options = Object.entries(index.properties).map(this.convertIndexOption).filter(Boolean);

    return `{ fields: { ${fields.join(', ')} }, options: { name: '${index.name}', ${options.join(', ')} } }`;
  }

  /**
   *
   * @param param0
   */
  convertIndexField([key, value]: [string, any]): string {
    if (Number.isInteger(value)) {
      return `'${key}': ${value}`;
    }

    return `'${key}': '${value}'`;
  }

  /**
   *
   * @param param0
   */
  convertIndexOption([key, value]: [string, any]): string | undefined {
    switch (true) {
      case typeof value === 'undefined' || typeof value === 'boolean':
        return value === true ? `'${key}': true` : undefined;
        break;

      default:
        throw new Error('Index options type is unknown');
    }
  }
}
