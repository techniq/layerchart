<script lang="ts">
	import { cubicOut } from 'svelte/easing';
	import { Chart, Layer } from 'layerchart';
	import TransformContextControls from '$lib/components/controls/TransformContextControls.svelte';
</script>

<Chart
	transform={{
		mode: 'canvas',
		motion: { type: 'tween', duration: 800, easing: cubicOut },
		initialScrollMode: 'scale'
	}}
	height={500}
>
	<TransformContextControls />

	<Layer type="html">
		<div class="h-full flex justify-center">
			<img
				src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/Ghostscript_Tiger.svg/512px-Ghostscript_Tiger.svg.png?20091116194118"
				alt="Ghostscript Tiger"
				class="h-full"
			/>
		</div>
	</Layer>
</Chart>
