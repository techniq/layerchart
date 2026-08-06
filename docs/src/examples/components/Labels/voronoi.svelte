<script lang="ts">
	import { range } from 'd3-array';
	import { randomNormal } from 'd3-random';
	import { Field, RangeField, SelectField, Switch } from 'svelte-ux';

	import { Chart, Labels, Layer, Points, Voronoi } from 'layerchart';

	type LinkType = 'straight' | 'square' | 'beveled' | 'rounded' | 'swoop';

	const width = 900;
	const height = 600;
	const randomX = randomNormal(width / 2, 110);
	const randomY = randomNormal(height / 2, 95);
	const data = range(110)
		.map((i) => ({ i, x: randomX(), y: randomY() }))
		.filter((d) => d.x >= 0 && d.x <= width && d.y >= 0 && d.y <= height);

	const linkTypeOptions: Array<{ label: string; value: LinkType }> = [
		{ label: 'Straight', value: 'straight' },
		{ label: 'Swoop', value: 'swoop' },
		{ label: 'Rounded', value: 'rounded' },
		{ label: 'Square', value: 'square' },
		{ label: 'Beveled', value: 'beveled' }
	];

	let linkType = $state<LinkType>('straight');
	let useLinks = $state(true);
	let occludeLabels = $state(true);
	let spacing = $state(2);
	let showVoronoi = $state(false);

	export { data };
</script>

<div class="flex flex-wrap items-center gap-4 mb-2 screenshot-hidden">
	<SelectField
		label="Links"
		options={linkTypeOptions}
		bind:value={linkType}
		clearable={false}
		toggleIcon={null}
		stepper
		class="w-60"
	>
		<div
			slot="append"
			class="flex items-center pl-2"
			onclick={(e) => e.stopPropagation()}
			role="none"
		>
			<Switch bind:checked={useLinks} size="md" />
		</div>
	</SelectField>
	<Field label="Occlude" let:id>
		<div class="flex items-center gap-2 w-60">
			<RangeField bind:value={spacing} min={0} max={50} disabled={!occludeLabels} class="flex-1" />
			<Switch bind:checked={occludeLabels} size="md" {id} />
		</div>
	</Field>
	<Field label="Show voronoi" let:id>
		<Switch bind:checked={showVoronoi} {id} />
	</Field>
</div>

<Chart {data} x="x" xDomain={[0, width]} y="y" yDomain={[0, height]} padding={16} height={500}>
	<Layer>
		{#if showVoronoi}
			<Voronoi classes={{ path: 'stroke-surface-content/20' }} />
		{/if}
		<Points r={2} class="fill-surface-content" />
		<Labels
			value={(d) => d.i}
			layout="voronoi"
			links={useLinks ? { type: linkType, class: 'stroke-surface-content/40' } : false}
			occlude={occludeLabels ? { padding: spacing } : false}
			fontSize={10}
			class="fill-surface-content pointer-events-none"
		/>
	</Layer>
</Chart>
