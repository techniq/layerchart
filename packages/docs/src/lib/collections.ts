/**
 * Sort a docs collection by optional `order` first, then alphabetically by name.
 */
export function sortCollection<T extends { order?: number; name: string }>(items: T[]): T[] {
	return items.slice().sort((a, b) => {
		if (a.order !== undefined && b.order !== undefined) return a.order - b.order;
		if (a.order !== undefined) return -1;
		if (b.order !== undefined) return 1;
		return a.name.localeCompare(b.name);
	});
}
