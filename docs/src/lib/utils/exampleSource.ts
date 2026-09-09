const CLOSE_SCRIPT = '</' + 'script>';

/**
 * Mirrors what `Code` actually renders — it displays `stripIndent(source)`, which strips
 * the common leading indent and trims both ends. Seeding the editor with the raw source
 * instead leaves the file's trailing newline as a visible empty last line, so Edit shows
 * one more line than View.
 *
 * Kept in step by hand: `stripIndent` lives in `@layerstack/docs` but isn't re-exported
 * from its public `utils` entry.
 */
export function normalizeSource(text: string) {
	const lines = text.split('\n');
	const minIndent = lines
		.filter((line) => line.trim().length > 0)
		.reduce((min, line) => Math.min(min, line.match(/^(\s*)/)?.[1].length ?? 0), Infinity);
	return lines
		.map((line) => line.slice(minIndent))
		.join('\n')
		.trim();
}

/**
 * Examples end in `export { data };` on disk, but the docs pipeline strips it from the
 * source it hands `Example` — it exists purely so the Data dialog can read the example's
 * data, and showing it would just confuse readers. Put it back before compiling an edited
 * example, or the Data button disappears the moment anyone types.
 *
 * Deliberately narrow: only when the source declares a top-level `data`, doesn't already
 * export it, and has exactly one closing script tag to append to (a `<script module>`
 * block would otherwise receive the export, where `data` isn't in scope).
 *
 * Lives here rather than inside `Example.svelte` because a literal closing-script string
 * in a component's `<script>` ends the block early and breaks the parse.
 */
export function exposeData(source: string) {
	if (/export\s*\{[^}]*\bdata\b|export\s+(?:const|let|var)\s+data\b/.test(source)) return source;
	if (!/^[ \t]*(?:const|let|var)\s+data\b/m.test(source)) return source;
	if (source.split(CLOSE_SCRIPT).length !== 2) return source;
	return source.replace(CLOSE_SCRIPT, `\texport { data };\n${CLOSE_SCRIPT}`);
}
