import { dataColumnType } from '../../types';
import AbstractConverter from './abstract';

/**
 *
 */
export default class ConverterUUIDv4 extends AbstractConverter<dataColumnType> {
  /**
   *
   */
  columnToTypes() {
    return 'string | Buffer';
  }

  /**
   *
   */
  columnToDefinitions(column: dataColumnType) {
    let additionalOptions = '';
    if (column.default) {
      additionalOptions += `default: ${column.default},`;
    }
    if (column.required) {
      additionalOptions += 'required: true,';
    }
    if (column.populate) {
      additionalOptions += `ref: '${column.populate.substr(0, 1).toUpperCase() + column.populate.substr(1)}',`;
    }

    return `{ type: Buffer, get: uuidGetter, set: uuidSetter, subtype: bson.Binary.SUBTYPE_UUID, ${additionalOptions} }`;
  }

  /**
   *
   */
  columnToVirtuals() {
    return '';
  }

  columnToImports() {
    return ["import { uuidGetter, uuidSetter, bson, uuidv4 } from '../uuidHelpers';"];
  }
}
