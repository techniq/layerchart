export type SearchEntry = {
	title: string;
	slug: string;
	content: string;
	type: 'component' | 'example' | 'guide' | 'util';
	category?: string;
	/** For examples, the component name (e.g., 'AreaChart') */
	component?: string;
	/** For examples, the example name (e.g., 'basic') */
	example?: string;
};

export type SearchResult = {
	content: string[];
	slug: string;
	title: string;
	type: SearchEntry['type'];
	/** For examples, the component name (e.g., 'AreaChart') */
	component?: string;
	/** For examples, the example name (e.g., 'basic') */
	example?: string;
};
