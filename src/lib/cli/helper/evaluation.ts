export const mergeEvaluation = <T>(
  mainCall: (item: T | undefined) => T,
  subCalls: ((item: T) => T)[] = [],
  item?: T,
): T => {
  return subCalls.reduce((subItem, evaluation) => evaluation(subItem), mainCall(item));
};
