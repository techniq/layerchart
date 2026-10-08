<script module lang="ts">
	import { getFlare } from '$lib/data.remote';
	const data = await getFlare();
</script>

<script lang="ts">
	import { hierarchy, type HierarchyNode } from 'd3-hierarchy';
	import { scaleLinear, scaleSqrt } from 'd3-scale';
	import { hcl } from 'd3-color';
	import { sortFunc } from '@layerstack/utils';
	import { cubicInOut } from 'svelte/easing';
	import { Field, ToggleGroup, ToggleOption } from 'svelte-ux';

	import { Chart, getStringWidth, isometric, Layer, Rect, Text, Tooltip } from 'layerchart';
	import { Treemap } from 'layerchart/hierarchy';
	import TransformContextControls from '$lib/components/controls/TransformContextControls.svelte';

	let view = $state<'flat' | 'isometric'>('isometric');

	const root = hierarchy(data)
		.sum((d) => d.value)
		.sort(sortFunc('value', 'desc'));

	// Each node takes the middle of its parent's hue range, split evenly among siblings, so a
	// package's modules share its hue
	const hues = new WeakMap<object, number>();
	(function assignHue(node: HierarchyNode<any>, from: number, to: number) {
		hues.set(node.data, (from + to) / 2);
		const step = (to - from) / (node.children?.length ?? 1);
		node.children?.forEach((child, i) => assignHue(child, from + step * i, from + step * (i + 1)));
	})(root, 0, 360);

	// Deeper tiers are darker and more saturated
	const luminance = scaleLinear([0, root.height], [85, 35]);
	const chroma = scaleSqrt([0, root.height], [0, 60]);
	const nodeColor = (node: HierarchyNode<any>) =>
		hcl(hues.get(node.data)!, chroma(node.depth), luminance(node.depth));

	/** `rotate` turned half round if, seen from where the view is, it would read right to left */
	function readable(rotate: number, m: { a: number; b: number; c: number; d: number } | null) {
		if (!m) return rotate;
		// Which way the text's baseline runs across the screen: the floor's x or y axis
		const across = rotate === 90 ? m.c : m.a;
		return across < 0 ? rotate + 180 : rotate;
	}

	/** A leaf's label: along its longer side, as large as fits */
	function leafLabel(node: { x0: number; y0: number; x1: number; y1: number; data: any }) {
		const width = node.x1 - node.x0;
		const height = node.y1 - node.y0;
		const vertical = height > width;
		const name = node.data.name.toUpperCase();
		const along = vertical ? height : width;
		const across = vertical ? width : height;
		// Unmeasured (ex. on the server), as large as the box is across
		const width10px =
			getStringWidth(name, { fontSize: '10px', fontWeight: '600' } as CSSStyleDeclaration) ?? 0;
		const fontSize = Math.min((10 * along * 0.9) / width10px, across * 0.8);
		return { name, vertical, fontSize };
	}
</script>

<Field label="View" class="w-fit">
	<ToggleGroup bind:value={view} variant="outline">
		<ToggleOption value="flat">Flat</ToggleOption>
		<ToggleOption value="isometric">Isometric</ToggleOption>
	</ToggleGroup>
</Field>

<!-- One thin tier per level of the tree, each a `zScale` step tall -->
<Chart
	zDomain={[0, root.height + 1]}
	zRange={({ height }) => [0, ((root.height + 1) * height) / 80]}
	view={isometric({
		// Seen from directly above when flat
		rotate: view === 'flat' ? 0 : -45,
		tilt: view === 'flat' ? 0 : 60,
		motion: { type: 'tween', duration: 800, easing: cubicInOut }
	})}
	transform={{
		mode: 'canvas',
		scrollMode: 'scale',
		// Drag to pan and shift-drag to turn, or the reverse via the controls.  Eases the zoom
		// buttons and reset
		motion: { type: 'tween', duration: 800, easing: cubicInOut }
	}}
	padding={24}
	height={600}
	clip
>
	{#snippet children({ context })}
		<TransformContextControls />

		<Layer>
			<Treemap hierarchy={root} paddingOuter={4}>
				{#snippet children({ nodes })}
					<!--
						In drawing order, back to front.  Unkeyed, so as the view turns each row takes its new
						node (a canvas draws in mount order)
					-->
					{#each nodes as node}
						{@const top = context.zScale(node.depth + 1)}
						<Rect
							x={node.x0}
							y={node.y0}
							width={node.x1 - node.x0}
							height={node.y1 - node.y0}
							z={[context.zScale(node.depth), top]}
							fill={nodeColor(node).toString()}
							class="stroke-black/25"
							strokeWidth={0.5}
							onpointermove={(e) => context.tooltip.show(e, node)}
							onpointerleave={context.tooltip.hide}
						/>
						{#if !node.children}
							{@const label = leafLabel(node)}
							{#if label.fontSize >= 2}
								<!-- Lying on the box's top, so nearer boxes drawn later cover it -->
								<Text
									x={(node.x0 + node.x1) / 2}
									y={(node.y0 + node.y1) / 2}
									z={top}
									value={label.name}
									rotate={readable(label.vertical ? 90 : 0, context.isometricMatrix)}
									fontSize={label.fontSize}
									textAnchor="middle"
									verticalAnchor="middle"
									fill={nodeColor(node).darker(1).toString()}
									class="pointer-events-none font-semibold"
								/>
							{/if}
						{/if}
					{/each}
				{/snippet}
			</Treemap>
		</Layer>

		<Tooltip.Root>
			{#snippet children({ data })}
				<Tooltip.Header>
					{data
						.ancestors()
						.reverse()
						.slice(1)
						.map((n: HierarchyNode<any>) => n.data.name)
						.join(' / ') || data.data.name}
				</Tooltip.Header>
				<Tooltip.List>
					<Tooltip.Item label="value" value={data.value} format="integer" />
				</Tooltip.List>
			{/snippet}
		</Tooltip.Root>
	{/snippet}
</Chart>
