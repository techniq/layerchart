<script lang="ts">
	import { Area, Axis, Chart, ChartClipPath, Layer, LinearGradient } from 'layerchart';
	import { State } from 'svelte-ux';
	import { getAppleStock } from '$lib/data.remote';

	const data = $derived(await getAppleStock());

	export { data };
</script>

<div class="border rounded-sm p-4 grid gap-1">
	<State initial={{ xDomain: [null, null], yDomain: [0, null] }} let:value let:set>
		<Chart
			{data}
			x="date"
			xDomain={value?.xDomain}
			y="value"
			yDomain={value?.yDomain}
			padding={{ left: 16, bottom: 24 }}
			brush={{
				axis: 'both',
				resetOnEnd: true,
				onBrushEnd: (e) => {
					set({
						// @ts-expect-error
						xDomain: e.xDomain,
						// @ts-expect-error
						yDomain: e.yDomain
					});
				}
			}}
			height={300}
		>
			<Layer>
				<Axis placement="left" grid rule />
				<Axis placement="bottom" rule />
				<ChartClipPath>
					<LinearGradient class="from-primary/50 to-primary/1" vertical>
						{#snippet children({ gradient })}
							<Area line={{ class: 'stroke-2 stroke-primary' }} fill={gradient} />
						{/snippet}
					</LinearGradient>
				</ChartClipPath>
			</Layer>
		</Chart>
	</State>
</div>
