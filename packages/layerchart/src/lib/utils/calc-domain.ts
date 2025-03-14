import { partialDomain } from './partial-domain.js';
import type { DomainType } from './scales.js';
import type { AxisKey, Extents } from './types.js';

type DomainFunction = (extent: number[]) => Array<number | null>;
type DomainArray = Array<number | null>;

type NormalizeArray<T> =
  T extends Array<infer U> ? (U extends string | number ? number[] : never) : never;

function normalizeExtent(values: Array<number | string> | undefined): number[] {
  if (!values) return [0, 0];

  return values.map((value): number => {
    if (typeof value === 'number') {
      return Number.isFinite(value) ? value : 0;
    }
    if (typeof value === 'string') {
      const num = Number(value);
      return Number.isNaN(num) ? 0 : num;
    }
    return 0;
  });
}

/**
 * Creates a function to calculate a domain based on extents and a domain directive.
 * @param s The key (e.g., 'x', 'y') to look up in the extents object
 * @returns A function that computes the final domain from extents and a domain input
 */
export default function calcDomain<K extends AxisKey>(
  s: K,
  extents: Extents,
  domain: DomainType | undefined
): number[] {
  let resolvedDomain: Array<number | null> | undefined;

  if (typeof domain === 'function') {
    const extentNumbers = normalizeExtent(extents?.[s as K]);
    resolvedDomain = (domain as DomainFunction)(extentNumbers);
  } else {
    resolvedDomain = domain as DomainArray | undefined;
  }

  if (extents?.[s as K]) {
    return partialDomain(
      normalizeExtent(extents[s as K]) as NormalizeArray<Extents[K]>,
      resolvedDomain
    );
  }

  return (resolvedDomain?.map((d): number => d ?? 0) ?? [0, 0]) as number[];
}
