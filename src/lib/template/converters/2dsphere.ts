import { schemaTypes } from '../../mongo';
import AbstractConverter from './abstract';

/**
 *
 */
export default class Converter2dSphere extends AbstractConverter<undefined> {
  /**
   *
   */
  columnToTypes() {
    return '{ type: string, coordinates: [number | undefined , number | undefined] }';
  }

  /**
   *
   */
  columnToDefinitions() {
    const items = [
      `type: { type: ${schemaTypes.string.definition}, default: 'Point', enum: ['Point']}`,
      `coordinates: { type: [${schemaTypes.number.definition}], default: [] }`,
    ];

    return `{ ${items.join(', ')} }`;
  }

  /**
   *
   */
  columnToVirtuals() {
    return '';
  }
}
