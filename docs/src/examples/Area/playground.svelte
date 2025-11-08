<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import { Area, Axis, Chart, Points, Layer } from 'layerchart';
	import AreaPlaygroundControls from '$lib/components/AreaPlaygroundControls.svelte';
	import CurveMenuField from '$lib/components/CurveMenuField.svelte';

	let config = $state({
		pathGenerator: (x: number) => x,
		curve: undefined as ComponentProps<typeof CurveMenuField>['value'],
		pointCount: 10,
		showPoints: false,
		showLine: true,
		show: true,
		tweened: true
	});

	const motion = $derived(config.tweened ? 'tween' : 'none');

	const data = $derived(
		Array.from({ length: config.pointCount }).map((_, i) => {
			return {
				x: i + 1,
				y: config.pathGenerator?.(i / config.pointCount) ?? i
			};
		})
	);

	export { data };
</script>

<AreaPlaygroundControls bind:config />
<Chart {data} x="x" y="y" yNice padding={20} height={300}>
	<Layer>
		<Axis placement="left" grid rule />
		<Axis placement="bottom" rule />
		{#if config.show}
			<Area
				curve={config.curve}
				line={config.showLine && { class: 'stroke-primary stroke-2' }}
				{motion}
				class="fill-primary/10"
			/>

			{#if config.showPoints}
				<Points {motion} r={3} class="fill-surface-100 stroke-primary" />
			{/if}
		{/if}
	</Layer>
</Chart>
