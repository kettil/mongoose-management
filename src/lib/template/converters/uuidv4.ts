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
    const defaultVal = column.default !== undefined ? `default: ${column.default},` : '';

    return `{ type: Buffer, get: uuidGetter, set: uuidSetter, ${defaultVal} }`;
  }

  /**
   *
   */
  columnToVirtuals() {
    return '';
  }

  columnToImports() {
    return [
      "import { v4 as uuidv4 } from 'uuid';",
      "import {getter as uuidGetter, setter as uuidSetter} from '../uuidHelpers';",
    ];
  }
}
