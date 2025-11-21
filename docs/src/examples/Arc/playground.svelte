<script lang="ts">
	import { Arc, Chart, LinearGradient, Text, Layer } from 'layerchart';
	import ArcPlaygroundControls from '$lib/components/controls/ArcPlaygroundControls.svelte';

	let config = $state({
		show: true,
		value: 60,
		spring: true,
		domain: [0, 100] as [number, number],
		range: [-90, 90] as [number, number],
		innerRadius: 70,
		outerRadius: 140,
		cornerRadius: 8,
		padAngle: 0,
		outerText: 'Outer Text',
		innerText: 'Inner Text',
		centroidText: 'Centroid Text',
		textSize: 16
	});
</script>

<ArcPlaygroundControls bind:config />

<Chart height={350}>
	<Layer center>
		{#if config.show}
			{#key config.spring}
				<LinearGradient class="from-secondary to-primary" vertical>
					{#snippet children({ gradient })}
						<Arc
							value={config.value}
							domain={config.domain}
							range={config.range}
							innerRadius={config.innerRadius}
							outerRadius={config.outerRadius}
							cornerRadius={config.cornerRadius}
							padAngle={config.padAngle}
							motion={config.spring ? 'spring' : undefined}
							fill={gradient}
							track={{ class: 'fill-surface-content/5' }}
						>
							{#snippet children({ value, getArcTextProps })}
								<Text
									value={Math.round(value)}
									textAnchor="middle"
									verticalAnchor="middle"
									class="text-4xl"
									dy={8}
								/>
								<!-- Arc labels -->
								<Text
									{...getArcTextProps('inner')}
									value={config.innerText}
									font-size="{config.textSize}px"
									truncate
								/>
								<Text
									{...getArcTextProps('outer')}
									value={config.outerText}
									font-size="{config.textSize}px"
									truncate
								/>
								<Text
									{...getArcTextProps('middle')}
									value={config.centroidText}
									font-size="{config.textSize}px"
									class="fill-black"
									truncate
								/>
							{/snippet}
						</Arc>
					{/snippet}
				</LinearGradient>
			{/key}
		{/if}
	</Layer>
</Chart>
