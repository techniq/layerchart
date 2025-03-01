import { memoize } from 'lodash-es';

export const memoizeObject = memoize(
  (obj) => obj,
  (obj) => JSON.stringify(obj)
);
