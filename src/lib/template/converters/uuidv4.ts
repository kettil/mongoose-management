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
    return 'string';
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

    return `{ type: Buffer, get: uuidGetter, set: uuidSetter, subtype: bson.Binary.SUBTYPE_UUID, ${additionalOptions} }`;
  }

  /**
   *
   */
  columnToVirtuals() {
    return '';
  }

  columnToImports() {
    return ["import { getter as uuidGetter, setter as uuidSetter, bson, uuidv4 } from '../uuidHelpers';"];
  }
}
