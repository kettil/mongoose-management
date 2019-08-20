import Converter from '../converter';

/**
 *
 */
export default abstract class AbstractConverter<T> {
  /**
   *
   * @param converter
   */
  constructor(protected converter: Converter) {}

  /**
   *
   * @param value
   */
  abstract columnToTypes(value: T): string;

  /**
   *
   * @param value
   */
  abstract columnToDefinitions(value: T): string;

  /**
   *
   * @param value
   */
  abstract columnToVirtuals(value: T): string;
}
