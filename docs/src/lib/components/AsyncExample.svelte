<script lang="ts">
	import { Code } from '@layerstack/docs/components';

	let { component, name }: { component: string; name: string } = $props();

	const Component = (await import(`../../examples/${component}/${name}.svelte`)).default;
	const source = (await import(`../../examples/${component}/${name}.svelte?raw`)).default;
</script>

<Component />
<Code {source} />
