import { query, getRequestEvent } from '$app/server';
import { env } from '$env/dynamic/private';
import { api } from './api';

export const getStats = query(async () => {
	const { fetch } = getRequestEvent();

	const githubHeaders: Record<string, string> = { Accept: 'application/vnd.github.v3+json' };
	if (env.GITHUB_API_TOKEN) {
		const prefix = env.GITHUB_API_TOKEN.startsWith('ghp_') ? 'token' : 'Bearer';
		githubHeaders['Authorization'] = `${prefix} ${env.GITHUB_API_TOKEN}`;
	}

	const [githubData, npmWeeklyData, npmMonthlyData, npmLifetimeData, discordData, bskyData] =
		await Promise.all([
			api('https://api.github.com', 'repos/techniq/layerchart', {
				fetch,
				headers: githubHeaders
			}),
			api('https://api.npmjs.org', 'downloads/point/last-week/layerchart', { fetch }),
			api('https://api.npmjs.org', 'downloads/point/last-month/layerchart', { fetch }),
			api('https://api.npmjs.org', 'downloads/point/2020-01-01:2099-12-31/layerchart', {
				fetch
			}),
			api('https://discord.com', 'api/v9/invites/697JhMPD3t?with_counts=true', { fetch }),
			api('https://public.api.bsky.app', 'xrpc/app.bsky.actor.getProfile?actor=techniq.dev', {
				fetch
			})
		]);

	const githubStars = (githubData?.stargazers_count as number) ?? null;
	const npmWeekly = (npmWeeklyData?.downloads as number) ?? null;
	const npmMonthly = (npmMonthlyData?.downloads as number) ?? null;
	const npmLifetime = (npmLifetimeData?.downloads as number) ?? null;
	const bskyFollowers = (bskyData?.followersCount as number) ?? null;
	const discordMembers = (discordData?.approximate_member_count as number) ?? null;

	const npmDownloads: [number | null, number | null, number | null] = [
		npmWeekly,
		npmMonthly,
		npmLifetime
	];

	return { githubStars, npmDownloads, bskyFollowers, discordMembers };
});
