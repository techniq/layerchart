import { calcExtents } from 'layercake';
import calcUniques, { type UniqueResults } from './calc-uniques.js';
import { isOrdinalDomain } from './is-ordinal-domain.js';
import type { AnyScale } from './scales.js';
import type { FieldAccessors } from './types.js';

interface ScaleInfo {
  scale: AnyScale;
  sort?: boolean;
}

interface ActiveScales {
  [key: string]: ScaleInfo;
}

interface ScaleGroups<T> {
  ordinal: FieldAccessors<T> | false;
  other: FieldAccessors<T> | false;
}

/**
 * Calculates scale extents for given data and scales
 * @template T The type of data objects in the input array
 * @param {T[]} flatData Array of data objects
 * @param {FieldAccessors<T>} getters Field accessor functions
 * @param {ActiveScales} activeScales Object containing scale information
 * @returns {Extents} Calculated extents for each scale
 */
export function calcScaleExtents<T>(
  flatData: T[],
  getters: FieldAccessors<T>,
  activeScales: ActiveScales
): UniqueResults {
  // group scales by domain type (ordinal vs other)
  const scaleGroups = Object.entries(activeScales).reduce<ScaleGroups<T>>(
    (groups, [key, scaleInfo]) => {
      const domainType = isOrdinalDomain(scaleInfo.scale) ? 'ordinal' : 'other';

      if (!groups[domainType]) {
        groups[domainType] = {};
      }

      (groups[domainType] as FieldAccessors<T>)[key as keyof FieldAccessors<T>] =
        getters[key as keyof FieldAccessors<T>];

      return groups;
    },
    { ordinal: false, other: false }
  );

  let extents: UniqueResults = {};

  // ordinal scales
  if (scaleGroups.ordinal) {
    const sortOptions = Object.fromEntries(
      Object.entries(activeScales).map(([key, scaleInfo]) => [
        key,
        scaleInfo.sort ?? false, // default to false if sort is undefined
      ])
    );
    extents = calcUniques(flatData, scaleGroups.ordinal, sortOptions);
  }

  // other scales
  if (scaleGroups.other) {
    const otherExtents = calcExtents(flatData, scaleGroups.other);
    extents = { ...extents, ...otherExtents };
  }

  return extents;
}
