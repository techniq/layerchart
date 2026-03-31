/**
 * Prettier plugin that preserves the content of `* diff` code blocks as-is,
 * preventing prettier from reformatting embedded code (e.g. `svelte diff`).
 *
 * When prettier sees `lang: 'svelte'` inside a markdown code block it calls
 * prettier-plugin-svelte to format the content, which collapses diff lines.
 * We wrap the svelte parser and bail out (throw) when asked to format diff
 * content from inside a markdown file — prettier catches the error and prints
 * the block verbatim, which is exactly what we want.
 *
 * Detection strategy:
 *  - `options.parentParser === 'markdown'`  → we're an embedded parser, not
 *    formatting a real .svelte file (safe to throw without side-effects)
 *  - content has lines starting with `+ ` or `- ` → looks like a diff
 */
import { parsers as svelteParsers } from 'prettier-plugin-svelte';

const baseSvelteParser = svelteParsers.svelte;

/** @type {import('prettier').Plugin} */
export default {
	parsers: {
		svelte: {
			...baseSvelteParser,
			async parse(text, options) {
				if (
					options.parentParser === 'markdown' &&
					text.split('\n').some((line) => /^[+-] /.test(line))
				) {
					throw new Error('Diff content detected — preserving block as-is');
				}
				return baseSvelteParser.parse(text, options);
			}
		}
	}
};
