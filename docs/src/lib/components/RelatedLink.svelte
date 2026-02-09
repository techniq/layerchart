<script lang="ts">
	import { Button } from 'svelte-ux';
	import { toTitleCase } from '@layerstack/utils';

	import LucideLink from '~icons/lucide/link';
	import LucideGithub from '~icons/lucide/github';
	import LucideCode from '~icons/lucide/code';
	import LucideGlobe from '~icons/lucide/globe';

	import ComponentLink from './ComponentLink.svelte';

	let { value }: { value: string } = $props();

	let { type, name, url, icon } = $derived.by(() => {
		if (value.startsWith('http')) {
			var url = new URL(value);
			if (url.hostname.includes('github.com')) {
				return { type: 'github', name: url.pathname.slice(1), url, icon: LucideGithub };
			} else {
				return { type: 'website', name: url, url, icon: LucideGlobe };
			}
		} else if (value.startsWith('/')) {
			return { type: 'docs', name: toTitleCase(value.slice(1)), url: value, icon: LucideLink };
		} else if (!value.includes('/')) {
			return {
				type: 'component',
				name: value,
				url: `/docs/components/${value}`,
				icon: undefined
			};
		} else {
			const [type, name] = value.split('/');
			return { type, name, url: `/docs/${type}/${name}`, icon: LucideCode };
		}
	});
</script>

{#if type === 'component'}
	<ComponentLink component={name as string} />
{:else}
	<Button
		{icon}
		variant="fill-light"
		href={url.toString()}
		target={value.startsWith('http') ? '_blank' : undefined}
		size="sm"
	>
		{name}
	</Button>
{/if}
