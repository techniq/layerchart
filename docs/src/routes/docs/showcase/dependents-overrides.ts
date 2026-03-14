import type { Dependent } from './dependency.remote';

export const TIER_LEVELS = [
	{ level: 'Gold Level', min: 100 },
	{ level: 'Silver Level', min: 25 },
	{ level: 'Bronze Level', min: 10 },
	{ level: 'Backers Level', min: 1 }
] as const;

// Sponsors may not be on github, or if they are they may not have public repos.
// This file is used to override or fill in missing dependent data.
// fields here serve as the base; fetched dependent data layer on top
// Tier overrides cn be used to control order to some degree.
export const SPONSOR_OVERRIDES: Record<string, Partial<Dependent>> = {
	tenzir: { name: 'Tenzir', homepageurl: 'https://tenzir.com/', tierOverride: 'Silver Level' },
	huntabyte: { homepageurl: 'https://shadcn-svelte.com/', tierOverride: 'Bronze Level' },
	jycouet: {
		name: 'Sky Zoo',
		homepageurl: 'https://skyzoo.blue/',
		description: 'Bluesky Stats',
		tierOverride: 'Bronze Level'
	}
};

export const FEATURED_SITES: Dependent[] = [
	{
		name: 'Zipline AI',
		description: 'Features, context and embeddings for real-time AI/ML',
		repourl: 'https://github.com/zipline-ai',
		homepageurl: 'https://zipline.ai/'
	},
	{
		name: 'Github Analysis',
		description: 'Analyze your GitHub repositories and NPM packages',
		repourl: 'https://github.com/techniq/github-analysis',
		homepageurl: 'https://github.techniq.dev',
		noregenerate: true
	},
	{
		name: 'Strava Analysis',
		description: 'Analyze your Strava activities',
		repourl: 'https://github.com/techniq/strava-analysis',
		homepageurl: 'https://strava.techniq.dev',
		noregenerate: true
	}
];

// These do not have a GH repo, but will be promoted by adding to the top of popular sites.
export const HIGHLIGHTED_SITES: Dependent[] = [
	{
		name: 'GEO audit',
		description: 'GEO / AI audit that tracks your visibility impact',
		homepageurl: 'https://www.geoaud.it/'
	},
	{
		name: 'RetireNumber',
		description: 'Get a second opinion on your retirement number.',
		homepageurl: 'https://retirenumber.com/'
	},
	{
		name: 'PowerOutage.com',
		description: 'Tracks, records, and aggregates power outage data across the World',
		homepageurl: 'https://poweroutage.com/'
	},
	{
		name: 'IOM UN Migration: Ukraine Regional Response',
		description: 'Needs, Intentions, and Border Crossings',
		homepageurl:
			'https://dtm.iom.int/online-interactive-resources/ukraine-regional-response-dashboard/index.html'
	},
	{
		name: 'Loyola Chicago: Center for Criminal Justice',
		description: 'The First Year of the Pretrial Fairness Act',
		homepageurl: 'https://pfa-1yr.loyolaccj.org/'
	},
	{
		name: 'ftop',
		description: 'Comperative performance metrics for Fortnite islands',
		homepageurl: 'https://ftop.app/'
	},
	{
		name: 'Nocturne',
		description: 'A next-generation platform for diabetes management',
		homepageurl: 'https://nocturne.app/'
	}
];
