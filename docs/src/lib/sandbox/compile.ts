import { compile } from 'svelte/compiler';
import { compileOptions } from './compile-options';
import { link } from './link';

export type Diagnostic = {
	from: number;
	to: number;
	severity: 'error' | 'warning';
	message: string;
	/** 1-based, for the error overlay. Absent when the compiler gave no position. */
	line?: number;
	column?: number;
};

export type CompileResult = {
	/** Blob URL of the linked module, or `null` when compilation failed. */
	url: string | null;
	diagnostics: Diagnostic[];
};

/** Strip the trailing `https://svelte.dev/e/...` docs link the compiler appends. */
function cleanMessage(message: string) {
	return message.replace(/\s*https:\/\/svelte\.dev\/[ew]\/\S+\s*$/, '');
}

/** `base` is the example's directory, so relative imports of sibling modules resolve. */
export async function compileSource(
	source: string,
	{ base }: { base?: string } = {}
): Promise<CompileResult> {
	const diagnostics: Diagnostic[] = [];

	let js: string;
	let warnings: { message: string; start?: { character: number }; end?: { character: number } }[];

	try {
		const result = compile(source, compileOptions);
		js = result.js.code;
		warnings = result.warnings ?? [];
	} catch (err: any) {
		// `position` is a `[from, to]` character-offset pair, which is what the editor wants;
		// `start` carries the line/column the overlay reports.
		const [from, to] = err.position ?? [0, 0];
		return {
			url: null,
			diagnostics: [
				{
					from,
					to,
					severity: 'error',
					message: cleanMessage(err.message ?? String(err)),
					line: err.start?.line,
					column: err.start?.column != null ? err.start.column + 1 : undefined
				}
			]
		};
	}

	for (const warning of warnings) {
		diagnostics.push({
			from: warning.start?.character ?? 0,
			to: warning.end?.character ?? 0,
			severity: 'warning',
			message: cleanMessage(warning.message)
		});
	}

	const linked = await link(js, base);
	if (!linked.ok) {
		const problems = [
			...linked.unresolved.map((specifier) => ({
				specifier,
				message: `'${specifier}' is not available in the sandbox`
			})),
			...linked.failed.map(({ specifier, message }) => ({
				specifier,
				message: `Couldn't load '${specifier}': ${message}`
			})),
			...linked.missing.map(({ specifier, names }) =>
				specifier === 'svelte/internal/client'
					? {
							specifier: '',
							message: `Uses Svelte features no example uses, so the sandbox doesn't include them (${names.map((name) => `$.${name}`).join(', ')})`
						}
					: {
							specifier: names[0],
							message: `'${specifier}' doesn't provide ${names.map((name) => `'${name}'`).join(', ')} in the sandbox, which only offers what the examples use`
						}
			)
		];
		// No source position for an import problem — pin it to the offending specifier.
		for (const { specifier, message } of problems) {
			const at = source.indexOf(specifier);
			diagnostics.push({
				from: at === -1 ? 0 : at,
				to: at === -1 ? 0 : at + specifier.length,
				severity: 'error',
				message
			});
		}
		return { url: null, diagnostics };
	}

	return { url: linked.url, diagnostics };
}
