import { group } from 'd3-array';

export function getAccessor(key) {
	if (typeof key === 'function') {
		return key;
	} else {
		return (d) => d[key];
	}
}

/**
 * Pivot longer (columns to rows)
 *  - see: https://observablehq.com/d/3ea8d446f5ba96fe
 *  - see also: https://observablehq.com/d/ac2a320cf2b0adc4 as generator
 */
export function pivotLonger(data, columns, name, value) {
	const keep = data.columns.filter((c) => !columns.includes(c));
	return data.flatMap((d) => {
		const base = keep.map((k) => [k, d[k]]);
		return columns.map((column) => {
			return Object.fromEntries([...base, [name, column], [value, d[column]]]);
		});
	});
}

/**
 * Pivot wider (rows to columns)
 *  - see: https://github.com/d3/d3-array/issues/142#issuecomment-761861983
 */
export function pivotWider(data, column, name, value) {
	return Array.from(
		group(data, (d) => d[column]),
		([columnVal, items]) =>
			Object.fromEntries([[column, columnVal]].concat(items.map((d) => [d[name], d[value]])))
	);
}

export function first(items) {
	return items[0];
}

export function last(items) {
	return items[items.length - 1];
}
