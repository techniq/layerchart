<script lang="ts" module>
	import type { SVGAttributes } from 'svelte/elements';

	export type MinimalPropsWithoutHTML = {
		/**
		 * Single property component
		 */
		value: string;
	};

	export type MinimalProps = MinimalPropsWithoutHTML & SVGAttributes<SVGElement>;
</script>

<script lang="ts">
	const { value }: MinimalProps = $props();
</script>

<span>{value}</span>
