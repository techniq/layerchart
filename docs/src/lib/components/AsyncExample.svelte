<script lang="ts">
	import Code from './Code.svelte';

	let { component, name }: { component: string; name: string } = $props();

	const Component = (await import(`../../examples/${component}/${name}.svelte`)).default;
	const source = (await import(`../../examples/${component}/${name}.svelte?raw`)).default;
</script>

<Component />
<Code {source} />
