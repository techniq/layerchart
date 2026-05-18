import { parse } from '@layerstack/utils';

export type ProjectStatsOptions = {
	fetch?: typeof globalThis.fetch;
	githubToken?: string;
	githubRepo: string;
	npmPackage: string;
	discordInvite?: string;
	bskyActor?: string;
	userAgent?: string;
};

export type ProjectStats = {
	githubStars: number | null;
	npmDownloads: [number | null, number | null, number | null];
	bskyFollowers: number | null;
	discordMembers: number | null;
};

async function fetchJson<Data>(
	origin: string,
	resource: string,
	options: { fetch: typeof globalThis.fetch; headers?: Record<string, string> }
): Promise<Data | null> {
	const url = `${origin}/${resource}`;
	const response = await options.fetch(url, {
		headers: {
			'Content-Type': 'application/json',
			...options.headers
		}
	});

	const text = await response.text();

	if (!response.ok) {
		console.error(`API GET ${url} failed: ${response.status} ${response.statusText} - ${text}`);
		return null;
	}

	try {
		return parse<Data>(text);
	} catch {
		console.error(`API GET ${url} returned invalid JSON: ${text.slice(0, 200)}`);
		return null;
	}
}

function createGitHubHeaders(options: ProjectStatsOptions) {
	const headers: Record<string, string> = {
		Accept: 'application/vnd.github.v3+json',
		'User-Agent': options.userAgent ?? '@layerstack/docs'
	};

	if (options.githubToken) {
		const prefix = options.githubToken.startsWith('ghp_') ? 'token' : 'Bearer';
		headers['Authorization'] = `${prefix} ${options.githubToken}`;
	}

	return headers;
}

export async function getProjectStats(options: ProjectStatsOptions): Promise<ProjectStats> {
	const fetch = options.fetch ?? globalThis.fetch;
	const githubHeaders = createGitHubHeaders(options);

	const [githubData, npmWeeklyData, npmMonthlyData, npmLifetimeData, discordData, bskyData] =
		await Promise.all([
			fetchJson<{ stargazers_count?: number }>('https://api.github.com', `repos/${options.githubRepo}`, {
				fetch,
				headers: githubHeaders
			}),
			fetchJson<{ downloads?: number }>(
				'https://api.npmjs.org',
				`downloads/point/last-week/${options.npmPackage}`,
				{ fetch }
			),
			fetchJson<{ downloads?: number }>(
				'https://api.npmjs.org',
				`downloads/point/last-month/${options.npmPackage}`,
				{ fetch }
			),
			fetchJson<{ downloads?: number }>(
				'https://api.npmjs.org',
				`downloads/point/2020-01-01:2099-12-31/${options.npmPackage}`,
				{ fetch }
			),
			options.discordInvite
				? fetchJson<{ approximate_member_count?: number }>(
						'https://discord.com',
						`api/v9/invites/${options.discordInvite}?with_counts=true`,
						{ fetch }
					)
				: null,
			options.bskyActor
				? fetchJson<{ followersCount?: number }>(
						'https://public.api.bsky.app',
						`xrpc/app.bsky.actor.getProfile?actor=${options.bskyActor}`,
						{ fetch }
					)
				: null
		]);

	const npmWeekly = npmWeeklyData?.downloads ?? null;
	const npmMonthly = npmMonthlyData?.downloads ?? null;
	const npmLifetime = npmLifetimeData?.downloads ?? null;

	return {
		githubStars: githubData?.stargazers_count ?? null,
		npmDownloads: [npmWeekly, npmMonthly, npmLifetime],
		bskyFollowers: bskyData?.followersCount ?? null,
		discordMembers: discordData?.approximate_member_count ?? null
	};
}
