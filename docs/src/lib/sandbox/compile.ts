import { compile } from 'svelte/compiler';
import { link } from './link';

export type Diagnostic = {
	from: number;
	to: number;
	severity: 'error' | 'warning';
	message: string;
};

export type CompileResult = {
	/** Blob URL of the linked module, or `null` when compilation failed. */
	url: string | null;
	diagnostics: Diagnostic[];
	/** Time spent compiling + linking, in ms. */
	elapsed: number;
};

/** Strip the trailing `https://svelte.dev/e/...` docs link the compiler appends. */
function cleanMessage(message: string) {
	return message.replace(/\s*https:\/\/svelte\.dev\/[ew]\/\S+\s*$/, '');
}

export function compileSource(source: string): CompileResult {
	const started = performance.now();
	const diagnostics: Diagnostic[] = [];

	let js: string;
	let warnings: { message: string; start?: { character: number }; end?: { character: number } }[];

	try {
		const result = compile(source, {
			filename: 'Example.svelte',
			generate: 'client',
			css: 'injected',
			runes: true,
			dev: false
		});
		js = result.js.code;
		warnings = result.warnings ?? [];
	} catch (err: any) {
		// `position` is a `[from, to]` character-offset pair, which is what the editor wants.
		const [from, to] = err.position ?? [0, 0];
		return {
			url: null,
			diagnostics: [
				{ from, to, severity: 'error', message: cleanMessage(err.message ?? String(err)) }
			],
			elapsed: performance.now() - started
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

	const linked = link(js);
	if (!linked.ok) {
		// No source position for an unresolved import — pin it to the offending specifier.
		for (const specifier of linked.unresolved) {
			const at = source.indexOf(specifier);
			diagnostics.push({
				from: at === -1 ? 0 : at,
				to: at === -1 ? 0 : at + specifier.length,
				severity: 'error',
				message: `'${specifier}' is not available in the sandbox`
			});
		}
		return { url: null, diagnostics, elapsed: performance.now() - started };
	}

	return { url: linked.url, diagnostics, elapsed: performance.now() - started };
}
