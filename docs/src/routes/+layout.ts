import posthog from 'posthog-js';

import { browser, dev } from '$app/environment';

// Disable server-side rendering until AppLayout shift is fixed (issue #22)
export const ssr = false;

export const load = async () => {
	// Setup Posthog
	if (browser && !dev) {
		posthog.init('phc_EjObiSURIW3vFLwJYNXQ1DumcnVPI28mO5nbTRVPjs0', {
			api_host: 'https://app.posthog.com',
			capture_pageview: false,
			capture_pageleave: false
		});
	}

	// Only provide the glob imports - don't load anything yet
	// Child layouts will load only what they need
	const allExamples = import.meta.glob(
		['/src/examples/components/**/*.svelte', '/src/examples/utils/**/*.svelte'],
		{
			import: 'default'
		}
	);

	const allSources = import.meta.glob(
		['/src/examples/components/**/*.svelte', '/src/examples/utils/**/*.svelte'],
		{
			import: 'default',
			query: '?raw'
		}
	);

	return {
		allExamples,
		allSources
	};
};
