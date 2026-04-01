<script lang="ts">
	import { Chart, Vector, Polygon, Layer, Text, type VectorAnchor } from 'layerchart';
	import { Field, RangeField, ToggleGroup, ToggleOption } from 'svelte-ux';

	let length = $state(30);
	let rotate = $state(30);
	let width = $state(8);
	let anchor = $state<VectorAnchor>('middle');
</script>

<div class="grid gap-2 mb-2 screenshot-hidden">
	<div class="grid grid-cols-3 gap-3">
		<RangeField label="Length" bind:value={length} min={10} max={60} step={1} />
		<RangeField label="Width" bind:value={width} min={1} max={30} step={1} />
		<RangeField label="Rotate" bind:value={rotate} min={0} max={360} step={1} />
	</div>
	<Field label="Anchor">
		<ToggleGroup bind:value={anchor} variant="outline" size="sm" inset class="w-full">
			<ToggleOption value="start">start</ToggleOption>
			<ToggleOption value="middle">middle</ToggleOption>
			<ToggleOption value="end">end</ToggleOption>
		</ToggleGroup>
	</Field>
</div>

<Chart padding={{ top: 20, bottom: 10, left: 10, right: 10 }} height={300}>
	<Layer>
		<!-- Arrow (default, proportional width) -->
		<Text x={45} y={16} textAnchor="middle" class="text-xs fill-surface-content/50">arrow</Text>
		<Vector x={45} y={120} {length} {rotate} {anchor} class="stroke-primary" />

		<!-- Arrow with fixed width -->
		<Text x={125} y={16} textAnchor="middle" class="text-xs fill-surface-content/50"
			>arrow (width)</Text
		>
		<Vector x={125} y={120} {length} {rotate} {width} {anchor} class="stroke-secondary" />

		<!-- Spike (proportional width) -->
		<Text x={215} y={16} textAnchor="middle" class="text-xs fill-surface-content/50">spike</Text>
		<Vector
			x={215}
			y={120}
			{length}
			{rotate}
			{anchor}
			shape="spike"
			class="stroke-danger fill-danger/25"
		/>

		<!-- Spike with fixed width -->
		<Text x={305} y={16} textAnchor="middle" class="text-xs fill-surface-content/50"
			>spike (width)</Text
		>
		<Vector
			x={305}
			y={120}
			{length}
			{rotate}
			{anchor}
			shape="spike"
			{width}
			class="stroke-danger fill-danger/25"
		/>

		<!-- Custom: line + circle -->
		<Text x={395} y={16} textAnchor="middle" class="text-xs fill-surface-content/50">custom</Text>
		<Vector x={395} y={120} {length} {rotate} {anchor}>
			{#snippet children({ length: len })}
				<line x1={0} y1={0} x2={0} y2={-len} class="stroke-success" stroke-width={2} />
				<circle cx={0} cy={-len} r={4} class="fill-success" />
			{/snippet}
		</Vector>

		<!-- Custom: Polygon arrow -->
		<Text x={480} y={16} textAnchor="middle" class="text-xs fill-surface-content/50"
			>Polygon arrow</Text
		>
		<Vector x={480} y={120} {length} {rotate} {anchor}>
			{#snippet children({ length: len })}
				{@const s = len / 2}
				<Polygon
					points={[
						{ x: 0, y: -s },
						{ x: -s / 2, y: 0 },
						{ x: -s / 4, y: 0 },
						{ x: -s / 4, y: s },
						{ x: s / 4, y: s },
						{ x: s / 4, y: 0 },
						{ x: s / 2, y: 0 },
						{ x: 0, y: -s }
					]}
					class="fill-warning/50 stroke-warning"
				/>
			{/snippet}
		</Vector>

		<!-- Custom: Polygon star -->
		<Text x={570} y={16} textAnchor="middle" class="text-xs fill-surface-content/50"
			>Polygon star</Text
		>
		<Vector x={570} y={120} {length} {rotate} {anchor}>
			{#snippet children({ length: len })}
				<Polygon
					r={len * 0.35}
					points={6}
					inset={0.7}
					rotate={30}
					class="fill-info/50 stroke-info"
				/>
			{/snippet}
		</Vector>
	</Layer>
</Chart>
