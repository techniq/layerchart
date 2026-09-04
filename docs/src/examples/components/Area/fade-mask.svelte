<script lang="ts">
	import { Area, Axis, Chart, Layer, LinearGradient } from 'layerchart';

	import { createDateSeries } from '$lib/utils/data.js';

	const uid = $props.id();
	const maskId = `area-fade-${uid}`;

	const data = createDateSeries({ count: 30, min: 50, max: 100, value: 'integer' });

	export { data };
</script>

<Chart {data} x="date" y="value" yDomain={[0, null]} yNice padding={20} height={300}>
	{#snippet children({ context })}
		<Layer>
			<Axis placement="left" grid rule />
			<Axis placement="bottom" rule />

			<LinearGradient stops={['black', 'white']}>
				{#snippet children({ gradient })}
					<defs>
						<mask id={maskId}>
							<rect width={context.width} height={context.height} fill={gradient} />
						</mask>
					</defs>

					<Area
						mask="url(#{maskId})"
						class="fill-primary/30"
						line={{ class: 'stroke-2 stroke-primary' }}
					/>
				{/snippet}
			</LinearGradient>
		</Layer>
	{/snippet}
</Chart>
