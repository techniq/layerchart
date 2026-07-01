import type { MenuOption } from 'svelte-ux';
import type { SearchEntry } from '@layerstack/docs/search';

/** Default options shown in the search palette when there's no query. */
export const quickLinks: (MenuOption<string> & { result: SearchEntry })[] = [
	{
		label: 'Getting Started',
		value: 'docs/getting-started',
		group: 'Quick Links',
		result: {
			title: 'Getting Started',
			slug: 'docs/getting-started',
			type: 'page',
			content: 'Installation and setup guide'
		}
	},
	{
		label: 'Examples',
		value: 'docs/examples',
		group: 'Quick Links',
		result: {
			title: 'Examples',
			slug: 'docs/examples',
			type: 'page',
			content: 'Browse example charts and visualizations'
		}
	},
	{
		label: 'Releases',
		value: 'docs/releases',
		group: 'Quick Links',
		result: {
			title: 'Releases',
			slug: 'docs/releases',
			type: 'page',
			content: 'View changelog and release notes'
		}
	}
];
