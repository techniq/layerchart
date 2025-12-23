/**
 * Custom transformer for diff highlighting
 * Processes code blocks with 'diff' in the meta string to add/remove line styling
 * @returns {import('shiki').ShikiTransformer}
 */
export function shikiDiffTransformer() {
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
