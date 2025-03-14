import { InternSet } from 'd3-array';
import type { FieldAccessors } from './types.js';

interface SortOptions {
  sort?: boolean;
  x?: boolean;
  y?: boolean;
  z?: boolean;
  r?: boolean;
}

export interface UniqueResults {
  x?: (number | string)[];
  y?: (number | string)[];
  z?: (number | string)[];
  r?: (number | string)[];
}

/**
 * Calculate the unique values of desired fields
 * For example, data like this: [{ x: 0, y: -10 }, { x: 10, y: 0 }, { x: 5, y: 10 }]
 * and a fields object like this: {'x': d => d.x, 'y': d => d.y}
 * returns an object like this: { x: [0, 10, 5], y: [-10, 0, 10] }
 *
 * @template T The type of data objects in the input array
 * @param {T[]} data A flat array of data objects
 * @param {FieldAccessors<T>} fields An object containing accessor functions for fields
 * @param {SortOptions} [sortOptions={}] Sorting options for the results
 * @returns {UniqueResults} An object with unique values for each specified field
 * @throws {TypeError} If data is not an array or fields is not a valid object
 */
export default function calcUniques<T>(
  data: T[],
  fields: FieldAccessors<T>,
  sortOptions: SortOptions = {}
): UniqueResults {
  if (!Array.isArray(data)) {
    throw new TypeError(
      `The first argument of calcUniques() must be an array. You passed in a ${typeof data}. If you got this error using the <LayerCake> component, consider passing a flat array to the \`flatData\` prop. More info: https://layercake.graphics/guide/#flatdata`
    );
  }

  if (Array.isArray(fields) || fields === undefined || fields === null) {
    throw new TypeError(
      'The second argument of calcUniques() must be an object with field names as keys and accessor functions as values.'
    );
  }

  const uniques: UniqueResults = {};
  const keys = Object.keys(fields) as (keyof FieldAccessors<T>)[];

  for (const key of keys) {
    const set = new InternSet<number | string>();
    const accessor = fields[key];

    if (!accessor) continue;

    for (const item of data) {
      const value = accessor(item);

      if (Array.isArray(value)) {
        value.forEach((val) => set.add(val));
      } else {
        set.add(value);
      }
    }

    const results = Array.from(set);
    if (sortOptions.sort === true || sortOptions[key as keyof SortOptions] === true) {
      results.sort((a, b) => {
        // type-safe sorting for both numbers and strings
        if (typeof a === 'number' && typeof b === 'number') {
          return a - b;
        }
        return String(a).localeCompare(String(b));
      });
    }

    uniques[key] = results;
  }

  return uniques;
}
