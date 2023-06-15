<script lang="ts">
	import { inject } from '@vercel/analytics';
	import { mdiGithub } from '@mdi/js';
	import 'prism-themes/themes/prism-vsc-dark-plus.css';
	import { AppBar, AppLayout, Button, QuickSearch, Tooltip, createTheme } from 'svelte-ux';

	import { dev } from '$app/environment';
	import { afterNavigate, goto } from '$app/navigation';

	import NavMenu from './_NavMenu.svelte';

	inject({ mode: dev ? 'development' : 'production' });

	createTheme({
		AppBar: 'bg-accent-500 text-white shadow-md',
		AppLayout: {
			nav: 'bg-neutral-800 py-4'
		},
		NavItem: {
			root: 'text-gray-400 hover:text-white hover:bg-gray-300/10 [&:where(.is-active)]:text-sky-400 [&:where(.is-active)]:bg-gray-500/10 pl-6 py-2',
			indicator: 'bg-sky-500'
		}
	});

	let mainEl: HTMLElement;
	afterNavigate(() => {
		// @ts-ignore: `instant` not in spec, but supported by Chrome/Firefox - https://kilianvalkhof.com/2022/css-html/preventing-smooth-scrolling-with-javascript/
		mainEl.scrollTo({ top: 0, behavior: 'instant' });
	});

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

	<main class="scroll-smooth" bind:this={mainEl}>
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

	:global(main h1:not(.prose *, .ApiDocs *)) {
		@apply text-xl font-semibold mt-8 mb-2 ml-2 border-b border-gray-400 pb-1;
	}

	:global(main h2:not(.prose *, .ApiDocs *)) {
		@apply text-lg font-semibold mt-4 mb-1 ml-2;
	}

	:global(main h3:not(.prose *)) {
		@apply text-xs text-black/50 ml-2 mb-1;
	}
	:global(main :not(.prose) h2 + h3) {
		@apply -mt-1;
	}

	:global(nav h1) {
		@apply py-2 pl-4 mt-4 text-sm text-gray-200 font-bold bg-black/20 border-t border-b border-white/10;
	}

	:global(nav h2) {
		@apply pt-4 pb-2 pl-4 text-xs text-gray-200 font-bold;
	}
</style>
