/**
 * Strip markdown syntax to get plain text.
 * Useful for search indexing or generating plain text excerpts.
 */
export function stripMarkdown(content: string): string {
	return (
		content
			// Remove code blocks
			.replace(/```[\s\S]*?```/g, '')
			// Remove inline code
			.replace(/`[^`]+`/g, '')
			// Remove links but keep text
			.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
			// Remove images
			.replace(/!\[([^\]]*)\]\([^)]+\)/g, '')
			// Remove HTML tags
			.replace(/<[^>]+>/g, '')
			// Remove headings markup
			.replace(/^#{1,6}\s+/gm, '')
			// Remove bold/italic
			.replace(/\*{1,2}([^*]+)\*{1,2}/g, '$1')
			.replace(/_{1,2}([^_]+)_{1,2}/g, '$1')
			// Remove blockquotes
			.replace(/^>\s+/gm, '')
			// Remove horizontal rules
			.replace(/^[-*_]{3,}\s*$/gm, '')
			// Remove list markers
			.replace(/^[\s]*[-*+]\s+/gm, '')
			.replace(/^[\s]*\d+\.\s+/gm, '')
			// Remove MDX/directives like :example{...} or ::directive
			.replace(/:{1,2}\w+(\{[^}]*\})?/g, '')
			// Collapse multiple whitespace/newlines
			.replace(/\s+/g, ' ')
			.trim()
	);
}
