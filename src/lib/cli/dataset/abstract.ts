/**
 *
 */
export default abstract class AbstractDataset<P> {
  /**
   *
   * @param parent
   */
  constructor(protected parent: P) {}

  /**
   *
   */
  abstract getName(): string;

  /**
   *
   */
  abstract remove(): void;

  /**
   *
   */
  getParent() {
    return this.parent;
  }
}
