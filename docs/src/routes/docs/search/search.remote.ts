import { query } from '$app/server';
import { z } from 'zod';
import FlexSearch from 'flexsearch';
import { searchContent, type SearchEntry } from './searchContent';

export type { SearchEntry };

// Initialize index once on server
let searchIndex: InstanceType<typeof FlexSearch.Index>;

function ensureIndex() {
	if (!searchIndex) {
		searchIndex = new FlexSearch.Index({ tokenize: 'forward' });
		searchContent.forEach((item, i) => {
			const text = `${item.title} ${item.content}`;
			searchIndex.add(i, text);
		});
	}
}

function replaceTextWithMarker(text: string, match: string) {
	const regex = new RegExp(match, 'gi');
	return text.replaceAll(regex, (match) => `<mark class="rounded">${match}</mark>`);
}

function getMatches(text: string, searchTerm: string, limit = 1) {
	const regex = new RegExp(searchTerm, 'gi');
	const indexes = [];
	let matches = 0;
	let match;

	while ((match = regex.exec(text)) !== null && matches < limit) {
		indexes.push(match.index);
		matches++;
	}

	return indexes.map((index) => {
		const start = index - 20;
		const end = index + 80;
		const excerpt = text.substring(start, end).trim();
		return `...${replaceTextWithMarker(excerpt, searchTerm)}...`;
	});
}

export const search = query(
	z.object({ query: z.string() }),
	async ({ query: searchQuery }): Promise<SearchEntry[]> => {
		if (!searchQuery) return [];

		ensureIndex();

		const match = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
		const results = searchIndex.search(match) as number[];

		const testMatch = (text: string) => {
			const regex = new RegExp(match, 'gi');
			return regex.test(text);
		};

		return results
			.map((index: number) => searchContent[index])
			.filter(({ title, content }) => {
				return testMatch(title) || testMatch(content);
			})
			.map((entry) => {
				const matches = getMatches(entry.content, match);
				return {
					slug: entry.slug,
					title: replaceTextWithMarker(entry.title, match),
					content: matches.length ? matches[0] : entry.content.substring(0, 100) + '...',
					type: entry.type,
					category: entry.category,
					component: entry.component,
					example: entry.example
				};
			});
	}
);
