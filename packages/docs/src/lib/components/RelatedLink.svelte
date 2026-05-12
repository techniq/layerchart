<script lang="ts">
	import { Button } from 'svelte-ux';
	import { toTitleCase } from '@layerstack/utils';

	import LucideCode from '~icons/lucide/code';
	import LucideGithub from '~icons/lucide/github';
	import LucideGlobe from '~icons/lucide/globe';
	import LucideLink from '~icons/lucide/link';

	import ComponentLink from './ComponentLink.svelte';

	let {
		value,
		resolveComponentExample
	}: {
		value: string;
		resolveComponentExample?: (component: string) => string | undefined;
	} = $props();

	let { type, name, url, icon } = $derived.by(() => {
		if (value.startsWith('http')) {
			const url = new URL(value);
			if (url.hostname.includes('github.com')) {
				return { type: 'github', name: url.pathname.slice(1), url: url.toString(), icon: LucideGithub };
			}
			return { type: 'website', name: url.toString(), url: url.toString(), icon: LucideGlobe };
		}

		if (value.startsWith('/')) {
			return { type: 'docs', name: toTitleCase(value.slice(1)), url: value, icon: LucideLink };
		}

		if (!value.includes('/')) {
			return {
				type: 'component',
				name: value,
				url: `/docs/components/${value}`,
				icon: undefined
			};
		}

		const [type, name] = value.split('/');
		return { type, name, url: `/docs/${type}/${name}`, icon: LucideCode };
	});
</script>

{#if type === 'component'}
	<ComponentLink component={name} resolveExample={resolveComponentExample} />
{:else}
	<Button
		{icon}
		variant="fill-light"
		href={url}
		target={value.startsWith('http') ? '_blank' : undefined}
		size="sm"
	>
		{name}
	</Button>
{/if}
