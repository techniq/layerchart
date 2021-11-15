import { visit } from 'unist-util-visit';
import prettier from 'prettier/esm/standalone.mjs';
import typescriptPlugin from 'prettier/esm/parser-typescript.mjs';
import sveltePlugin from 'prettier-plugin-svelte';
import Prism from 'prismjs';
import 'prism-svelte';

const { format } = prettier;

/**
 * Inject `code` prop to <Preview>
 */
function codePreview() {
	function visitor(node) {
		// TODO: Support updating Preview nested in other markup.  https://stackoverflow.com/questions/14768735/regex-replace-only-inside-tag-need-help-writing-regex
		// TODO: Support Passing props to preview (isDark, class, etc)
		if (node.value.startsWith('<Preview>')) {
			// Get contents between <Preview> tag
			const code = node.value.match(/<Preview>([^]*)<\/Preview>/)[1];

			const formattedCode = format(code, {
				parser: 'svelte',
				plugins: [typescriptPlugin, sveltePlugin],
				svelteBracketNewLine: true
			});
			const highlightedCode = Prism.highlight(formattedCode, Prism.languages.svelte, 'svelte');
			node.value = `<Preview code="{\`${highlightedCode}\`}" language="svelte">${code}</Preview>`;
		}
	}

	return (tree) => {
		visit(tree, 'html', visitor);
	};
}

export default {
	extensions: ['.md', '.svx'],
	layout: './src/lib/docs/Layout.svelte',
	remarkPlugins: [codePreview]
	// highlight: false
};
