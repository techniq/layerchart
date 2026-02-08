import FlexSearch, { type Index as FlexSearchIndex } from 'flexsearch';
import type { SearchEntry } from './searchContent';

export type { SearchEntry };

let searchIndex: FlexSearchIndex;
let searchData: SearchEntry[] = [];
let initialized = false;

/**
 * Initialize the search index with data fetched from the API.
 */
export async function initSearch(): Promise<void> {
	if (initialized) return;

	const response = await fetch('/api/search.json');
	searchData = await response.json();

	searchIndex = new FlexSearch.Index({
		tokenize: 'forward'
	});

	searchData.forEach((entry, i) => {
		const text = `${entry.title} ${entry.content}`;
		searchIndex.add(i, text);
	});

	initialized = true;
}

function escapeRegex(str: string): string {
	return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function highlightMatch(text: string, query: string): string {
	const regex = new RegExp(escapeRegex(query), 'gi');
	return text.replace(regex, (match) => `<mark class="rounded">${match}</mark>`);
}

function getSnippet(text: string, query: string, contextLength = 80): string {
	const lowerText = text.toLowerCase();
	const lowerQuery = query.toLowerCase();
	const index = lowerText.indexOf(lowerQuery);

	if (index === -1) {
		return text.substring(0, contextLength) + (text.length > contextLength ? '...' : '');
	}

	const start = Math.max(0, index - 20);
	const end = Math.min(text.length, index + query.length + contextLength);
	const snippet = text.substring(start, end).trim();

	return (
		(start > 0 ? '...' : '') + highlightMatch(snippet, query) + (end < text.length ? '...' : '')
	);
}

/**
 * Search the index and return matching entries
 */
export function search(query: string): SearchEntry[] {
	if (!initialized || !query.trim()) return [];

	const searchTerm = query.trim();

	const results = searchIndex.search(searchTerm) as number[];

	return results
		.map((idx) => searchData[idx])
		.map((entry) => ({
			...entry,
			content: getSnippet(entry.content, searchTerm)
		}));
}
