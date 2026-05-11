/**
 * Strip markdown syntax to get plain text.
 *
 * @param {string} content
 */
export function stripMarkdown(content) {
	return (
		content
			.replace(/```[\s\S]*?```/g, '')
			.replace(/`[^`]+`/g, '')
			.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
			.replace(/!\[([^\]]*)\]\([^)]+\)/g, '')
			.replace(/<[^>]+>/g, '')
			.replace(/^#{1,6}\s+/gm, '')
			.replace(/\*{1,2}([^*]+)\*{1,2}/g, '$1')
			.replace(/_{1,2}([^_]+)_{1,2}/g, '$1')
			.replace(/^>\s+/gm, '')
			.replace(/^[-*_]{3,}\s*$/gm, '')
			.replace(/^[\s]*[-*+]\s+/gm, '')
			.replace(/^[\s]*\d+\.\s+/gm, '')
			.replace(/:{1,2}\w+(\{[^}]*\})?/g, '')
			.replace(/\s+/g, ' ')
			.trim()
	);
}
