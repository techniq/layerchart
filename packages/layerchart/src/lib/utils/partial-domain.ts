/**
 * If we have a domain from settings (the directive), fill in
 * any null values with ones from our measured extents;
 * otherwise, return the measured extent.
 * @param domain A two-value array of numbers representing the measured extent
 * @param directive A two-value array of numbers or nulls that will have any nulls filled in from the `domain` array
 * @returns A two-value array of numbers representing the filled-in domain
 */
export function partialDomain(domain: number[] = [], directive?: Array<number | null>): number[] {
  if (Array.isArray(directive) && directive.length === 2) {
    return directive.map((d, i) => (d === null ? domain[i] : d));
  }
  return domain;
}
