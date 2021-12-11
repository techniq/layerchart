/**
 * Convert easing into path data with number of points
 * see: https://svelte.dev/examples#easing
 */
export function getEasingPath(easing: (t: number) => number, count = 1000) {
	let pathData = `M0 ${count}`;
	for (let i = 1; i <= count; i++) {
		pathData += `
			L${(i / count) * count}
			${count - easing(i / count) * count}
		`;
	}

	return pathData;
}
