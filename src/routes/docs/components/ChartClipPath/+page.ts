import type { PageLoad } from './$types';

export const load = (async () => {
	return {
		meta: {
			description:
				'Convenient way to clip specific components (axis labels, etc) within chart while still allowing some to overflow (tooltips, etc)'
		}
	};
}) satisfies PageLoad;
