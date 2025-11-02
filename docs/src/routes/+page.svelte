<script lang="ts">
	import { cls } from '@layerstack/tailwind';

	const links = [
		{ label: 'Home', href: '/' },
		{ label: 'Docs', href: '/docs' },
		{ label: 'Github', href: 'https://github.com/techniq/layerchart' }
	];
</script>

<header class="flex h-16 items-center px-4 py-2">
	<a href="/" class="text-xl font-bold lg:w-60">LayerChart</a>

	<div class="flex gap-2 grow justify-center">
		{#each links as { label, href }}
			<a
				{href}
				class={cls(
					'text-sm px-3 py-1 rounded-full text-surface-content hover:bg-surface-200',
					href === '/' && 'bg-surface-200 text-initial'
				)}
				target={href.startsWith('http') ? '_blank' : '_self'}
			>
				{label}
			</a>
		{/each}
	</div>

	<div class="hidden lg:block lg:w-60"></div>
</header>
