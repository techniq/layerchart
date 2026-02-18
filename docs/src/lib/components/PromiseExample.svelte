<script lang="ts">
	import Code from './Code.svelte';

	let { component, name }: { component: string; name: string } = $props();

	const componentPromise = import(`../../examples/${component}/${name}.svelte`);
	const sourcePromise = import(`../../examples/${component}/${name}.svelte?raw`);
</script>

{#await componentPromise}
	<p>Loading component...</p>
{:then module}
	<module.default />
{:catch error}
	<p>Error loading component: {error.message}</p>
{/await}

{#await sourcePromise}
	<p>Loading source...</p>
{:then source}
	<Code source={source.default} />
{:catch error}
	<p>Error loading source: {error.message}</p>
{/await}
