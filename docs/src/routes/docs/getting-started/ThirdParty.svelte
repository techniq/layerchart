<script lang="ts">
	import Tabs from '$lib/components/Tabs.svelte';
	import Code from '$lib/components/Code.svelte';
</script>

<Tabs
	keys={['shadcn-svelte', 'Skeleton 3', 'Skeleton 4', 'Svelte UX', 'DaisyUI 5']}
	classes={{ root: 'mt-4', content: 'p-0' }}
>
	{#snippet content(value)}
		{#if value === 0}
			<Code language="css" title="app.css" source={`@import 'layerchart/shadcn-svelte.css';`} />
		{:else if value === 1}
			<Code language="css" title="app.css" source={`@import 'layerchart/skeleton-3.css';`} />
		{:else if value === 2}
			<Code language="css" title="app.css" source={`@import 'layerchart/skeleton-4.css';`} />
		{:else if value === 3}
			<Code language="css" title="app.css" source={`/* Works out of the box! */`} />
		{:else if value === 4}
			<Code language="css" title="app.css" source={`@import 'layerchart/daisyui-5.css';`} />
		{:else if value === 5}
			<Code language="css" title="app.css" source={`@import 'layerchart/standalone.css';`} />
		{/if}
	{/snippet}
</Tabs>
