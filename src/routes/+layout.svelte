<script lang="ts">
	import { inject } from '@vercel/analytics';
	import { mdiGithub } from '@mdi/js';
	import 'prism-themes/themes/prism-vsc-dark-plus.css';
	import { AppBar, AppLayout, Button, QuickSearch, Tooltip } from 'svelte-ux';

	import { dev } from '$app/environment';
	import { goto } from '$app/navigation';

	import NavMenu from './_NavMenu.svelte';

	inject({ mode: dev ? 'development' : 'production' });

	const quickSearchOptions = Object.entries(
		import.meta.glob('./docs/**/+page.(md|svelte)', { as: 'raw', eager: true })
	).flatMap(([file, source]) => {
		const url = file.replace('.', '').replace(/\/\+page.(md|svelte)/, '');
		const [_, docs, group, name] = url.split('/');
		return {
			name,
			value: url,
			group: group
		};
	});
</script>

<AppLayout>
	<nav slot="nav" class="nav h-full">
		<NavMenu />
	</nav>

	<AppBar title="LayerChart">
		<div slot="actions">
			<QuickSearch options={quickSearchOptions} on:change={(e) => goto(e.detail.value)} />

			<Tooltip title="View repository" placement="left" offset={2}>
				<Button
					icon={mdiGithub}
					href="https://github.com/techniq/layerchart"
					class="p-2"
					target="_blank"
				/>
			</Tooltip>
		</div>
	</AppBar>

	<main class="scroll-smooth">
		<slot />
	</main>
</AppLayout>

<style lang="postcss">
	@tailwind base;
	@tailwind components;
	@tailwind utilities;

	:global(body) {
		@apply bg-black/10;
	}

	:global(h1) {
		@apply text-xl font-semibold mt-8 mb-2 ml-2 border-b border-gray-400 pb-1;
	}

	:global(h2) {
		@apply text-lg font-semibold mt-8 mb-1 ml-2;
	}
	:global(h2:first-child) {
		@apply mt-0;
	}

	:global(h3) {
		@apply text-xs text-black/50 ml-2 mb-1;
	}
	:global(h2 + h3) {
		@apply -mt-1;
	}
</style>
