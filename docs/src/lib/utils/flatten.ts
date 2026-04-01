/**
 * Flatten arrays of arrays one level deep
 * @param list The list to flatten
 * @param accessor An optional accessor function or string property key
 * @returns Flattened array
 */
export default function flatten<T, U>(
	list: T[],
	accessor: string | ((item: T) => U[]) = (d: T) => d as unknown as U[]
): U[] {
	// type the accessor function based on input
	const acc: (item: T) => U[] =
		typeof accessor === 'string' ? (d: T) => d[accessor as keyof T] as U[] : accessor;

	// check if list is array and first element through accessor is array
	const firstElement = list[0] && acc(list[0]);
	if (Array.isArray(list) && Array.isArray(firstElement)) {
		let flat: U[] = [];
		const l = list.length;
		for (let i = 0; i < l; i += 1) {
			flat = flat.concat(acc(list[i]));
		}
		return flat;
	}

	// type assertion here since we know list contains U[] if not flattened
	return list as unknown as U[];
}
