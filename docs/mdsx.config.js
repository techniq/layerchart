import { defineConfig } from 'mdsx';

import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';
import rehypePrettyCode from 'rehype-pretty-code';

import { readFileSync } from 'node:fs';
import path, { resolve } from 'node:path';
import process from 'node:process';
// import { fileURLToPath } from "node:url";
// import prettier from "@prettier/sync";
// import { getHighlighter } from 'shiki';
// import { createHighlighter } from 'shiki';
import { u } from 'unist-builder';
import { visit } from 'unist-util-visit';
// import { codeBlockPrettierConfig } from "./other/code-block-prettier.js";
// import { rehypeCustomHighlight } from '@mdsx/rehype-custom-highlighter';

/**
 * Custom transformer for diff highlighting
 * Processes code blocks with 'diff' in the meta string to add/remove line styling
 */
function shikiDiffTransformer() {
	return {
		name: 'diff-transformer',
		code(node) {
			// Check if this code block has 'diff' in the meta string
			const metaString = this.options.meta?.__raw || '';
			if (!metaString.includes('diff')) return;

			// Add class to the pre element
			this.addClassToHast(this.pre, 'has-diff');

			// Get all line elements
			const lines = node.children.filter((child) => child.type === 'element');

			for (const line of lines) {
				// Get all text tokens in this line
				const tokens = line.children.filter((child) => child.type === 'element');

				if (tokens.length === 0) continue;

				// Check the first token's text content
				const firstToken = tokens[0];
				const textNodes = firstToken.children?.filter((child) => child.type === 'text');

				if (!textNodes || textNodes.length === 0) continue;

				const firstText = textNodes[0];
				const text = firstText.value;

				if (text.startsWith('+')) {
					this.addClassToHast(line, 'diff-add');
					firstText.value = text.slice(1);
				} else if (text.startsWith('-')) {
					this.addClassToHast(line, 'diff-remove');
					firstText.value = text.slice(1);
				}
			}
		}
	};
}

/**
 * Custom transformer for line highlighting
 * Processes code blocks with {1,2,3} or {1-5} syntax in the meta string
 */
function shikiLineHighlightTransformer() {
	return {
		name: 'line-highlight-transformer',
		code(node) {
			const metaString = this.options.meta?.__raw || '';

			// Match {1,2,3} or {1-5} or {1,3-5,7}
			const highlightMatch = metaString.match(/\{([\d,-]+)\}/);
			if (!highlightMatch) return;

			// Parse the line numbers
			const lineNumbersStr = highlightMatch[1];
			const highlightLines = new Set();

			lineNumbersStr.split(',').forEach((part) => {
				if (part.includes('-')) {
					// Range: 1-5
					const [start, end] = part.split('-').map(Number);
					for (let i = start; i <= end; i++) {
						highlightLines.add(i);
					}
				} else {
					// Single line: 3
					highlightLines.add(Number(part));
				}
			});

			// Get all line elements
			const lines = node.children.filter((child) => child.type === 'element');

			lines.forEach((line, index) => {
				const lineNumber = index + 1;
				if (highlightLines.has(lineNumber)) {
					this.addClassToHast(line, 'line-highlight');
				}
			});
		}
	};
}

/**
 * @type {import('rehype-pretty-code').Options}
 */
const prettyCodeOptions = {
	theme: {
		light: 'github-light',
		dark: 'github-dark'
	},
	keepBackground: false,
	defaultLang: {
		block: 'plaintext'
		// inline: "plaintext",
	},
	transformers: [shikiDiffTransformer(), shikiLineHighlightTransformer()]
};

export const mdsxConfig = defineConfig({
	extensions: ['.md'],
	remarkPlugins: [remarkGfm],
	rehypePlugins: [
		rehypeSlug,
		// rehypeComponentExample,
		[rehypePrettyCode, prettyCodeOptions],
		rehypeAddCodeBlockClasses
	],
	blueprints: {
		default: {
			path: 'src/lib/markdown/blueprints/default/blueprint.svelte'
		}
	}
});

/**
 * Adds the source code to component examples.
 *
 * @returns {HastTransformer} - unified transformer
 */
function rehypeComponentExample() {
	return async (tree) => {
		const componentRegex = /component="([^"]+)"/;
		const nameRegex = /name="([^"]+)"/;

		visit(tree, (node, index, parent) => {
			if (node?.type === 'raw' && node?.value?.startsWith('<SourceExample')) {
				const currNode = node;

				const componentMatch = currNode.value.match(componentRegex);
				const component = componentMatch ? componentMatch[1] : null;
				if (!component) return null;

				const nameMatch = currNode.value.match(nameRegex);
				const name = nameMatch ? nameMatch[1] : null;
				if (!name) return null;

				try {
					const sourceCode = getComponentSourceFileContent(component, name);
					if (!sourceCode)
						throw new Error(
							`Could not find source code for component: ${component} example: ${name}`
						);

					const sourceCodeNode = u('element', {
						tagName: 'pre',
						properties: {
							className: ['code']
						},
						children: [
							u('element', {
								tagName: 'code',
								properties: {
									className: [`language-svelte`]
								},
								attributes: {},
								children: [
									{
										type: 'text',
										value: sourceCode
									}
								]
							})
						]
					});
					if (!index) return;
					parent.children.splice(index + 1, 0, sourceCodeNode);
				} catch (e) {
					console.error(e);
				}
			}
		});
	};
}

function getComponentSourceFileContent(component, name) {
	if (!component || !name) return null;

	const filePath = path.join(
		process.cwd(),
		`./src/examples/components/${component}/${name}.svelte`
	);
	try {
		const fileContents = readFileSync(filePath, 'utf-8');

		// return prettier.format(
		// 	transformComponentSourceContent(fileContents),
		// 	codeBlockPrettierConfig
		// );
		return fileContents;
	} catch (e) {
		console.error(`Error reading file at ${filePath}:`, e);
		return null;
	}
}

// TODO: improve `title` display
// https://github.com/svecosystem/svecodocs/blob/main/packages/kit/src/lib/configs/mdsx-config.ts#L83
// https://github.com/svecosystem/svecodocs/blob/main/packages/kit/src/lib/styles/globals.css

/**
 * Adds custom classes and data attributes to code blocks based on meta string
 * Supports syntax like ```js frame title="My Code" showLineNumbers
 */
function rehypeAddCodeBlockClasses() {
	return (tree) => {
		visit(tree, 'element', (node) => {
			if (node.tagName === 'pre') {
				node.properties.className = node.properties.className || [];

				// Check if the code element has a data-meta attribute from rehype-pretty-code
				const codeNode = node.children?.find((child) => child.tagName === 'code');
				const meta = codeNode?.data?.meta || codeNode?.properties?.metastring;

				if (meta) {
					// Check for 'frame' keyword
					if (meta.includes('frame')) {
						node.properties['data-frame'] = '';
					}

					// Extract title="..." if present
					const titleMatch = meta.match(/title="([^"]+)"/);
					if (titleMatch) {
						node.properties['data-title'] = titleMatch[1];
					}

					// Check for line numbers flag in meta
					if (meta.includes('showLineNumbers') || meta.includes('ln')) {
						node.properties['data-line-numbers'] = '';
					}
				}

				// Check recursively for [data-line] attribute in nested children
				function hasDataLine(element) {
					if (element.properties?.['data-line'] !== undefined) {
						return true;
					}
					if (element.children) {
						return element.children.some((child) => hasDataLine(child));
					}
					return false;
				}

				if (codeNode && hasDataLine(codeNode)) {
					node.properties['data-line-numbers'] = '';
				}

				// Extract language from code element
				const codeClassName = codeNode?.properties?.className;
				if (Array.isArray(codeClassName)) {
					const langClass = codeClassName.find((cls) => cls.startsWith('language-'));
					if (langClass) {
						const language = langClass.replace('language-', '');
						node.properties['data-language'] = language;
					}
				}
			}
		});
	};
}
