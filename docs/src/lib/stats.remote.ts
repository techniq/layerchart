import { query, getRequestEvent } from '$app/server';
import { env } from '$env/dynamic/private';
import { getProjectStats, type ProjectStats } from '@layerstack/docs/project-stats';

/** How long a Worker isolate reuses the stats it last fetched */
const MAX_AGE = 10 * 60 * 1000;

// npm and Discord rate-limit Cloudflare's shared egress IPs, so a fresh fetch per page view
// often comes back with some stats missing (`null`).  Kept per isolate: fetched at most every
// `MAX_AGE`, and any stat a fetch misses falls back to the last value seen.
let last: { stats: ProjectStats; fetchedAt: number } | undefined;

export const getStats = query(async () => {
	if (last && Date.now() - last.fetchedAt < MAX_AGE) return last.stats;

	const { fetch } = getRequestEvent();
	const stats = await getProjectStats({
		fetch,
		githubToken: env.GITHUB_API_TOKEN,
		githubRepo: 'techniq/layerchart',
		npmPackage: 'layerchart',
		discordInvite: '697JhMPD3t',
		bskyActor: 'techniq.dev',
		userAgent: 'LayerChart docs'
	});

	const prev = last?.stats;
	const merged: ProjectStats = {
		githubStars: stats.githubStars ?? prev?.githubStars ?? null,
		npmDownloads: stats.npmDownloads.map(
			(d, i) => d ?? prev?.npmDownloads[i] ?? null
		) as ProjectStats['npmDownloads'],
		bskyFollowers: stats.bskyFollowers ?? prev?.bskyFollowers ?? null,
		discordMembers: stats.discordMembers ?? prev?.discordMembers ?? null
	};
	last = { stats: merged, fetchedAt: Date.now() };
	return merged;
});
