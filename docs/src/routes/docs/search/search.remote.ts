import { prerender } from '$app/server';
import { searchContent, type SearchEntry } from './searchContent';

export type { SearchEntry };

/**
 * Prerendered remote function that returns the search index.
 * Runs at build time and caches the result client-side.
 */
export const getSearchContent = prerender(async (): Promise<SearchEntry[]> => {
	return searchContent;
});
