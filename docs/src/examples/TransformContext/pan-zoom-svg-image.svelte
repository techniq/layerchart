<script lang="ts">
	import { cubicOut } from 'svelte/easing';
	import { Chart, Layer } from 'layerchart';
	import TransformControls from '$lib/components/controls/TransformContextControls.svelte';
</script>

<Chart
	transform={{
		mode: 'canvas',
		motion: { type: 'tween', duration: 800, easing: cubicOut },
		initialScrollMode: 'scale'
	}}
	height={500}
>
	<TransformControls />

	<Layer type="svg">
		<image
			href="https://upload.wikimedia.org/wikipedia/commons/f/fd/Ghostscript_Tiger.svg"
			width="100%"
			height="100%"
		/>
	</Layer>
</Chart>
