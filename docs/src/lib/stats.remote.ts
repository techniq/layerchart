import { query, getRequestEvent } from '$app/server';
import { env } from '$env/dynamic/private';
import { getProjectStats } from '@layerstack/docs/project-stats';

export const getStats = query(async () => {
	const { fetch } = getRequestEvent();

	return getProjectStats({
		fetch,
		githubToken: env.GITHUB_API_TOKEN,
		githubRepo: 'techniq/layerchart',
		npmPackage: 'layerchart',
		discordInvite: '697JhMPD3t',
		bskyActor: 'techniq.dev',
		userAgent: 'LayerChart docs'
	});
});
