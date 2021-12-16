<script lang="ts">
	import { getContext } from 'svelte';

	/**
	 * Translate x
	 */
	export let x: number = undefined;

	/**
	 * Translate x
	 */
	export let y: number = undefined;

	/**
	 * Center within chart
	 */
	export let center: boolean = false;

	const { width, height } = getContext('LayerCake');

	let transform = undefined;

	$: if (x != null || y != null) {
		transform = `translate(${x ?? 0}, ${y ?? 0})`;
	}

	$: if (center) {
		transform = `translate(${$width / 2}, ${$height / 2})`;
	}
</script>

<g {transform} {...$$restProps}>
	<slot />
</g>
