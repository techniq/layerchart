import FlexSearch from 'flexsearch';

export type Post = {
	content: string;
	slug: string;
	title: string;
};

export type Result = {
	content: string[];
	slug: string;
	title: string;
};

let postsIndex: InstanceType<typeof FlexSearch.Index>;
let posts: Post[];

export function createPostsIndex(data: Post[]) {
	postsIndex = new FlexSearch.Index({ tokenize: 'forward' });

	data.forEach((post, i) => {
		const item = `${post.title} ${post.content}`;
		postsIndex.add(i, item);
	});

	posts = data;
}

export function searchPostsIndex(searchTerm: string) {
	const match = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	const results = postsIndex.search(match) as number[];

	// Filter to only include results that actually match the search term
	// Create a function to test matches to avoid regex state issues
	const testMatch = (text: string) => {
		const regex = new RegExp(match, 'gi');
		return regex.test(text);
	};

	return results
		.map((index: number) => posts[index])
		.filter(({ title, content }: { title: string; content: string }) => {
			// Only include if the search term actually appears in title or content
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
