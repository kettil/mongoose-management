import AbstractDataset from './abstract';

describe('Check the AbstractDataset class', () => {
  test('initialize the class', () => {
    const mock = jest.fn();

    const dataset = new (AbstractDataset as any)(mock);

    expect(dataset).toBeInstanceOf(AbstractDataset);

    expect(dataset.parent).toBe(mock);
  });

  test('it should be return the parent dataset when getParent() is called', () => {
    const mock = jest.fn();

    const dataset = new (AbstractDataset as any)(mock);

    const parent = dataset.getParent();

    expect(parent).toBe(mock);
  });
});
