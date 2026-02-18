import posthog from 'posthog-js';

import { browser, dev } from '$app/environment';

export const load = async ({ data }) => {
	// Setup Posthog
	if (browser && !dev) {
		posthog.init('phc_EjObiSURIW3vFLwJYNXQ1DumcnVPI28mO5nbTRVPjs0', {
			api_host: 'https://app.posthog.com',
			capture_pageview: false,
			capture_pageleave: false
		});
	}

	return { ...data };
};
