<script module lang="ts">
	import { getFlare } from '$lib/data.remote';
	const data = await getFlare();
</script>

<script lang="ts">
	import { hierarchy, treemap, type HierarchyNode } from 'd3-hierarchy';
	import { scaleLinear, scaleSqrt } from 'd3-scale';
	import { hcl } from 'd3-color';
	import { sortFunc } from '@layerstack/utils';

	import { getStringWidth } from 'layerchart';
	import { Chart, Rect, WebGL, Text, Tooltip, perspective } from '@layerchart/webgl';

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

	type Node = ReturnType<ReturnType<typeof treemap<any>>>;

	/** Laid out across the plot, a tier per level of the tree */
	function layout(width: number, height: number) {
		return treemap<any>().size([width, height]).paddingOuter(4)(root.copy()).descendants();
	}

	/** A leaf's label: along its longer side, as large as fits */
	function leafLabel(node: Node) {
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

<!-- One thin tier per level of the tree, each a `zScale` step tall -->
<Chart
	view={perspective({ rotate: -45, tilt: 60 })}
	transform={{ mode: 'canvas', drag: 'rotate', scrollMode: 'scale', scrollActivationKey: 'shift' }}
	zDomain={[0, root.height + 1]}
	zRange={({ height }) => [0, ((root.height + 1) * height) / 80]}
	tooltipContext
	height={600}
	class="cursor-grab active:cursor-grabbing"
>
	{#snippet children({ context })}
		{@const nodes = layout(context.width, context.height)}
		<WebGL>
			<Rect
				tooltip
				data={nodes}
				x={(d) => d.x0}
				y={(d) => d.y0}
				width={(d) => d.x1 - d.x0}
				height={(d) => d.y1 - d.y0}
				z={(d) => [context.zScale(d.depth), context.zScale(d.depth + 1)]}
				fill={(d) => nodeColor(d).toString()}
			/>
			<!-- Lying on the leaves' tops, so nearer boxes cover them as the view turns -->
			<Text
				data={nodes.filter((d) => !d.children && leafLabel(d).fontSize >= 2)}
				facing="up"
				x={(d) => (d.x0 + d.x1) / 2}
				y={(d) => (d.y0 + d.y1) / 2}
				z={(d) => context.zScale(d.depth + 1)}
				value={(d) => leafLabel(d).name}
				fontSize={(d) => leafLabel(d).fontSize}
				rotate={(d) => (leafLabel(d).vertical ? 90 : 0)}
				// Lit along with the tops they lie on, so a shade darker than the flat chart's to read
				fill={(d) => nodeColor(d).darker(2).toString()}
			/>
		</WebGL>

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
