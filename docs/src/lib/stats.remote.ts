import { query, getRequestEvent } from '$app/server';

export const getStats = query(async () => {
	const { fetch } = getRequestEvent();
	const [githubRes, npmWeeklyRes, npmMonthlyRes, npmLifetimeRes, discordRes, bskyRes] =
		await Promise.all([
			fetch('https://api.github.com/repos/techniq/layerchart', {
				headers: { Accept: 'application/vnd.github.v3+json' }
			}),
			fetch('https://api.npmjs.org/downloads/point/last-week/layerchart'),
			fetch('https://api.npmjs.org/downloads/point/last-month/layerchart'),
			fetch('https://api.npmjs.org/downloads/point/2020-01-01:2099-12-31/layerchart'),
			fetch('https://discord.com/api/v9/invites/697JhMPD3t?with_counts=true'),
			fetch('https://public.api.bsky.app/xrpc/app.bsky.actor.getProfile?actor=techniq.dev')
		]);

	const githubStars = githubRes.ok ? ((await githubRes.json()).stargazers_count as number) : null;
	const npmWeekly = npmWeeklyRes.ok ? ((await npmWeeklyRes.json()).downloads as number) : null;
	const npmMonthly = npmMonthlyRes.ok ? ((await npmMonthlyRes.json()).downloads as number) : null;
	const npmLifetime = npmLifetimeRes.ok
		? ((await npmLifetimeRes.json()).downloads as number)
		: null;
	const bskyFollowers = bskyRes.ok ? ((await bskyRes.json()).followersCount as number) : null;
	const discordMembers = discordRes.ok
		? ((await discordRes.json()).approximate_member_count as number)
		: null;

	const npmDownloads: [number | null, number | null, number | null] = [
		npmWeekly,
		npmMonthly,
		npmLifetime
	];

	return { githubStars, npmDownloads, bskyFollowers, discordMembers };
});
