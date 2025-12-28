import { visit } from 'unist-util-visit';

/**
 * Adds custom classes and data attributes to code blocks based on meta string
 * Supports syntax like ```js frame title="My Code" showLineNumbers
 * @returns {(tree: import('hast').Root) => void}
 */
export function rehypeCodeBlocks() {
	return (tree) => {
		visit(tree, 'element', (node) => {
			if (node.tagName === 'pre') {
				node.properties.className = node.properties.className || [];

				// Check if the code element has a data-meta attribute from rehype-pretty-code
				const codeNode = node.children?.find(
					(child) => child.type === 'element' && child.tagName === 'code'
				);

				if (!codeNode || codeNode.type !== 'element') return;

				// @ts-expect-error - rehype-pretty-code adds custom meta property
				const meta = codeNode.data?.meta || codeNode.properties?.metastring;

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
				/**
				 * @param {import('hast').Element} element
				 * @returns {boolean}
				 */
				function hasDataLine(element) {
					if (element.properties?.['data-line'] !== undefined) {
						return true;
					}
					if (element.children) {
						return element.children.some(
							(child) => child.type === 'element' && hasDataLine(child)
						);
					}
					return false;
				}

				if (hasDataLine(codeNode)) {
					node.properties['data-line-numbers'] = '';
				}

				// Extract language from code element
				const codeClassName = codeNode.properties?.className;
				if (Array.isArray(codeClassName)) {
					const langClass = codeClassName.find(
						(cls) => (typeof cls === 'string' && cls.startsWith('language-'))
					);
					if (typeof langClass === 'string') {
						const language = langClass.replace('language-', '');
						node.properties['data-language'] = language;
					}
				}
			}
		});
	};
}
