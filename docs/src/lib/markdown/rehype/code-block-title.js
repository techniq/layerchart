import { visit } from 'unist-util-visit';

/**
 * Handles metadata attributes for code blocks with titles
 * Adds data-metadata attribute when a figcaption (title) is present
 * @returns {(tree: import('hast').Root) => void}
 */
export function rehypeCodeBlockTitle() {
	return (tree) => {
		visit(tree, 'element', (node) => {
			if (
				node.tagName === 'figure' &&
				node.properties?.['data-rehype-pretty-code-figure'] !== undefined
			) {
				const preElement = node.children?.at(-1);
				const firstChild = node.children?.at(0);

				if (
					preElement &&
					preElement.type === 'element' &&
					preElement.tagName === 'pre' &&
					firstChild &&
					firstChild.type === 'element' &&
					firstChild.tagName === 'figcaption'
				) {
					node.properties['data-metadata'] = '';
					preElement.properties['data-metadata'] = '';
				}
			}
		});
	};
}
