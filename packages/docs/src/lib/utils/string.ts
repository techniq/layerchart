/**
 * Remove leading indentation from multiline string.
 */
export function stripIndent(text: string) {
	const lines = text.split('\n');

	const minIndent = lines
		.filter((line) => line.trim().length > 0)
		.reduce((min, line) => {
			const match = line.match(/^(\s*)/);
			const indent = match ? match[1].length : 0;
			return Math.min(min, indent);
		}, Infinity);

	return lines
		.map((line) => line.slice(minIndent))
		.join('\n')
		.trim();
}
