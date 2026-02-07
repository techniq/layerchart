export type SearchEntry = {
	title: string;
	slug: string;
	content: string;
	type: 'component' | 'example' | 'guide' | 'util';
	category?: string;
};

export type SearchResult = {
	content: string[];
	slug: string;
	title: string;
};
