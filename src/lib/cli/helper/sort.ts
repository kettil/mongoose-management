/**
 *
 * @param a
 * @param b
 */
export const sortByName = <T extends { getName: () => string }>(a: T, b: T) => {
  const pathA = a.getName().toLowerCase();
  const pathB = b.getName().toLowerCase();

  if (pathA === pathB) {
    return 0;
  }

  return pathA < pathB ? -1 : 1;
};

/**
 *
 * @param a
 * @param b
 */
export const sortByPath = <T extends { getPath: () => string }>(a: T, b: T) => {
  const pathA = a.getPath().toLowerCase();
  const pathB = b.getPath().toLowerCase();

  if (pathA === pathB) {
    return 0;
  }

  return pathA < pathB ? -1 : 1;
};
