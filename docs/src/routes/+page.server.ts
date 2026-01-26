export async function load({ fetch }) {
	const [githubRes, npmRes, bskyRes] = await Promise.all([
		fetch('https://api.github.com/repos/techniq/layerchart', {
			headers: { Accept: 'application/vnd.github.v3+json' }
		}),
		fetch('https://api.npmjs.org/downloads/point/last-week/layerchart'),
		fetch('https://public.api.bsky.app/xrpc/app.bsky.actor.getProfile?actor=techniq.dev')
	]);

	const stars = githubRes.ok ? ((await githubRes.json()).stargazers_count as number) : null;
	const weeklyDownloads = npmRes.ok ? ((await npmRes.json()).downloads as number) : null;
	const bskyFollowers = bskyRes.ok ? ((await bskyRes.json()).followersCount as number) : null;

	return { stars, weeklyDownloads, bskyFollowers };
}
