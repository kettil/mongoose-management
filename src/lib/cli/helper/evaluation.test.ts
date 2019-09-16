import { mergeEvaluation } from './evaluation';

/**
 *
 */
describe('Check the evaluation function', () => {
  /**
   *
   */
  test('it should be return expected value when mergeEvaluation() is called without subcalls', () => {
    const mockMain = jest.fn().mockReturnValue('test-data-main');

    const result = mergeEvaluation<string>(mockMain);

    expect(result).toBe('test-data-main');

    expect(mockMain).toHaveBeenCalledTimes(1);
    expect(mockMain).toHaveBeenCalledWith(undefined);
  });

  /**
   *
   */
  test('it should be return expected value when mergeEvaluation() is called', () => {
    const mockMain = jest.fn().mockReturnValue('test-data-main');
    const mockSub1 = jest.fn().mockReturnValue('test-data-sub1');
    const mockSub2 = jest.fn().mockReturnValue('test-data-sub2');

    const result = mergeEvaluation<string>(mockMain, [mockSub1, mockSub2], 'test-data');

    expect(result).toBe('test-data-sub2');

    expect(mockMain).toHaveBeenCalledTimes(1);
    expect(mockMain).toHaveBeenCalledWith('test-data');
    expect(mockSub1).toHaveBeenCalledTimes(1);
    expect(mockSub1).toHaveBeenCalledWith('test-data-main');
    expect(mockSub2).toHaveBeenCalledTimes(1);
    expect(mockSub2).toHaveBeenCalledWith('test-data-sub1');
  });
});
