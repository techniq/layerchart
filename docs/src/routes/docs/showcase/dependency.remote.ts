import { query, getRequestEvent } from '$app/server';
import { env } from '$env/dynamic/private';

const POPULAR_STAR_THRESHOLD = 100;
const OTHER_STAR_THRESHOLD = 10;

export type Dependent = {
	name?: string;
	reponame?: string;
	owner?: string;
	description: string;
	repourl?: string;
	homepageurl?: string;
	stars?: number;
};

export const getDependents = query(async () => {
	const { fetch } = getRequestEvent();

	const featuredSites: Dependent[] = [
		{
			name: 'Github Analysis',
			description: 'Analyze your GitHub repositories and NPM packages',
			repourl: 'https://github.com/techniq/github-analysis',
			homepageurl: 'https://github.techniq.dev'
		},
		{
			name: 'Strava Analysis',
			description: 'Analyze your Strava activities',
			repourl: 'https://github.com/techniq/strava-analysis',
			homepageurl: 'https://strava.techniq.dev'
		},
		{
			name: 'Zipline AI',
			description: 'Features, context and embeddings for real-time AI/ML',
			repourl: 'https://zipline.ai/',
			homepageurl: 'https://github.com/zipline-ai'
		}
	];

	const supporterSites: Dependent[] = [
		// could this be automated? pull sponsers, check dependents by owner === sponser, and add them here?
		{
			name: 'Tenzir',
			description: 'Open source data pipelines for security teams',
			repourl: 'https://github.com/tenzir',
			homepageurl: 'https://tenzir.com/'
		},
		{
			name: 'shadcn-svelte',
			description: 'shadcn/ui, but for Svelte.',
			repourl: 'https://github.com/huntabyte/shadcn-svelte',
			homepageurl: 'https://shadcn-svelte.com/'
		},
		{
			name: 'Sky Zoo',
			description: 'Bluesky stats',
			repourl: 'https://skyzoo.blue/',
			homepageurl: 'https://github.com/jycouet/jyc.dev'
		}
	];

	// These do not have a GH repo, but will be promoted by adding to the top of popular sites.
	const highlightedSites: Dependent[] = [
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

	const githubHeaders: Record<string, string> = {
		Accept: 'application/vnd.github.v3+json',
		'User-Agent': 'LayerChart docs'
	};

	if (env.GITHUB_API_TOKEN) {
		const prefix = env.GITHUB_API_TOKEN.startsWith('ghp_') ? 'token' : 'Bearer';
		githubHeaders['Authorization'] = `${prefix} ${env.GITHUB_API_TOKEN}`;
	}

	// Step 1: Find repos with "layerchart" in package.json via code search
	const repoSet = new Set<string>();
	let page = 1;
	const perPage = 100;

	while (true) {
		const searchUrl = `https://api.github.com/search/code?q=${encodeURIComponent('"layerchart" filename:package.json')}&per_page=${perPage}&page=${page}`;
		const res = await fetch(searchUrl, { headers: githubHeaders });

		if (!res.ok) {
			console.error(`GitHub code search failed: ${res.status} ${res.statusText}`);
			break;
		}

		const data = await res.json();
		const items = data.items ?? [];

		for (const item of items) {
			const fullName = item.repository?.full_name;
			if (fullName && fullName !== 'techniq/layerchart') {
				repoSet.add(fullName);
			}
		}

		if (items.length < perPage || repoSet.size >= data.total_count) break;
		page++;
	}

	// Step 2: Batch-fetch repo details via GraphQL
	const repos = [...repoSet];
	const dependents: Dependent[] = [];
	const batchSize = 50;

	for (let i = 0; i < repos.length; i += batchSize) {
		const batch = repos.slice(i, i + batchSize);
		const fragments = batch
			.map((fullName, idx) => {
				const [owner, name] = fullName.split('/');
				return `repo${idx}: repository(owner: ${JSON.stringify(owner)}, name: ${JSON.stringify(name)}) { stargazerCount forkCount description homepageUrl url owner { login } name }`;
			})
			.join('\n');

		const res = await fetch('https://api.github.com/graphql', {
			method: 'POST',
			headers: githubHeaders,
			body: JSON.stringify({ query: `{ ${fragments} }` })
		});

		if (!res.ok) {
			console.error(`GitHub GraphQL failed: ${res.status} ${res.statusText}`);
			continue;
		}

		const { data } = await res.json();
		if (!data) continue;

		for (const key of Object.keys(data)) {
			const repo = data[key];
			if (!repo) continue;

			dependents.push({
				owner: repo.owner.login,
				reponame: repo.name,
				description: repo.description || null,
				repourl: repo.url,
				homepageurl: repo.homepageUrl || null,
				stars: repo.stargazerCount
			});
		}
	}

	dependents
		.sort((a, b) => (b.stars ?? 0) - (a.stars ?? 0)) // Sort by stars descending
		.filter((d) => featuredSites.some((f) => f.reponame === d.reponame)) // Filter out any featured sites
		.filter((d) => supporterSites.some((s) => s.reponame === d.reponame)); // Filter out any supporter sites
	const popularSites = [
		...highlightedSites,
		...dependents.filter((d) => (d.stars ?? 0) >= POPULAR_STAR_THRESHOLD)
	];
	const otherSites = dependents.filter(
		(d) => (d.stars ?? 0) >= OTHER_STAR_THRESHOLD && (d.stars ?? 0) < POPULAR_STAR_THRESHOLD
	);

	return { featuredSites, supporterSites, popularSites, otherSites };
});
