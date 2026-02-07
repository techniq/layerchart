import { query } from '$app/server';
import { z } from 'zod';
import FlexSearch from 'flexsearch';
import { searchIndex } from './searchIndex';
import type { Post, Result } from './types';

export type { Post, Result };

// Initialize index once on server
let postsIndex: InstanceType<typeof FlexSearch.Index>;
let posts: Post[];

function ensureIndex() {
	if (!postsIndex) {
		postsIndex = new FlexSearch.Index({ tokenize: 'forward' });
		searchIndex.forEach((post, i) => {
			const item = `${post.title} ${post.content}`;
			postsIndex.add(i, item);
		});
		posts = searchIndex;
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
	async ({ query: searchQuery }): Promise<Result[]> => {
		if (!searchQuery) return [];

		ensureIndex();

		const match = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
		const results = postsIndex.search(match) as number[];

		const testMatch = (text: string) => {
			const regex = new RegExp(match, 'gi');
			return regex.test(text);
		};

		return results
			.map((index: number) => posts[index])
			.filter(({ title, content }: { title: string; content: string }) => {
				return testMatch(title) || testMatch(content);
			})
			.map(({ slug, title, content }: { slug: string; title: string; content: string }) => {
				return {
					slug,
					title: replaceTextWithMarker(title, match),
					content: getMatches(content, match)
				};
			});
	}
);
