import { readFileSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { u } from 'unist-builder';
import { visit } from 'unist-util-visit';

/**
 * Adds the source code to component examples.
 * @returns {(tree: import('unist').Node) => Promise<void>}
 */
export function rehypeComponentExample() {
	return async (tree) => {
		const componentRegex = /component="([^"]+)"/;
		const nameRegex = /name="([^"]+)"/;

		visit(tree, (node, index, parent) => {
			// Use type narrowing - node can have custom properties
			if (
				!node ||
				typeof node !== 'object' ||
				!('type' in node) ||
				!('value' in node) ||
				node.type !== 'raw' ||
				typeof node.value !== 'string' ||
				!node.value.startsWith('<SourceExample')
			) {
				return;
			}

			const componentMatch = node.value.match(componentRegex);
			const component = componentMatch ? componentMatch[1] : null;
			if (!component) return;

			const nameMatch = node.value.match(nameRegex);
			const name = nameMatch ? nameMatch[1] : null;
			if (!name) return;

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
								className: ['language-svelte']
							},
							children: [
								{
									type: 'text',
									value: sourceCode
								}
							]
						})
					]
				});

				if (index !== undefined && parent && typeof parent === 'object' && 'children' in parent) {
					const parentNode = /** @type {{ children: unknown[] }} */ (parent);
					if (Array.isArray(parentNode.children)) {
						parentNode.children.splice(index + 1, 0, sourceCodeNode);
					}
				}
			} catch (e) {
				console.error(e);
			}
		});
	};
}

/**
 * @param {string} component
 * @param {string} name
 * @returns {string | null}
 */
function getComponentSourceFileContent(component, name) {
	if (!component || !name) return null;

	const filePath = path.join(
		process.cwd(),
		`./src/examples/components/${component}/${name}.svelte`
	);
	try {
		const fileContents = readFileSync(filePath, 'utf-8');
		return fileContents;
	} catch (e) {
		console.error(`Error reading file at ${filePath}:`, e);
		return null;
	}
}
