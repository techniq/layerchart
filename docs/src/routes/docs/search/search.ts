import FlexSearch from 'flexsearch';
import type { SearchEntry } from './searchContent';

export type { SearchEntry };

// Two indexes: one for titles (higher weight), one for content
let titleIndex: FlexSearch.Index;
let contentIndex: FlexSearch.Index;
let searchData: SearchEntry[] = [];
let initialized = false;

/**
 * Initialize the search index with data fetched from the API
 */
export async function initSearch(): Promise<void> {
	if (initialized) return;

	const response = await fetch('/api/search.json');
	searchData = await response.json();

	titleIndex = new FlexSearch.Index({ tokenize: 'forward' });
	contentIndex = new FlexSearch.Index({ tokenize: 'forward' });

	searchData.forEach((entry, i) => {
		titleIndex.add(i, entry.title);
		contentIndex.add(i, entry.content);
	});

	initialized = true;
}

/**
 * Check if the search index is ready
 */
export function isInitialized(): boolean {
	return initialized;
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

	return (start > 0 ? '...' : '') + highlightMatch(snippet, query) + (end < text.length ? '...' : '');
}

/**
 * Search the index and return matching entries
 */
export function search(query: string): SearchEntry[] {
	if (!initialized || !query.trim()) return [];

	const searchTerm = query.trim();
	const escapedTerm = escapeRegex(searchTerm);

	// Search both indexes
	const titleResults = titleIndex.search(searchTerm, { limit: 20 }) as number[];
	const contentResults = contentIndex.search(searchTerm, { limit: 20 }) as number[];

	// Score results: title matches get higher weight
	const scores = new Map<number, number>();

	for (const idx of titleResults) {
		scores.set(idx, (scores.get(idx) || 0) + 10);
	}

	for (const idx of contentResults) {
		scores.set(idx, (scores.get(idx) || 0) + 5);
	}

	// Sort by score and get top results
	const sortedIndexes = [...scores.entries()]
		.sort((a, b) => b[1] - a[1])
		.slice(0, 15)
		.map(([idx]) => idx);

	// Filter to ensure the query actually matches
	const testMatch = (text: string) => {
		const regex = new RegExp(escapedTerm, 'gi');
		return regex.test(text);
	};

	return sortedIndexes
		.map((idx) => searchData[idx])
		.filter((entry) => testMatch(entry.title) || testMatch(entry.content))
		.map((entry) => ({
			...entry,
			content: getSnippet(entry.content, searchTerm)
		}));
}
