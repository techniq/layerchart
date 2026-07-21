<script module lang="ts">
	import { getRequestTrace } from '$lib/data.remote';
	let data = await getRequestTrace();
</script>

<script lang="ts">
	import { hierarchy } from 'd3-hierarchy';
	import { curveStepAfter } from 'd3-shape';
	import { scaleSequential } from 'd3-scale';
	import { interpolateYlOrRd } from 'd3-scale-chromatic';
	import {
		Area,
		Axis,
		Chart,
		Group,
		Layer,
		Rect,
		RectClipPath,
		Text,
		Tooltip,
		type ChartState
	} from 'layerchart';
	import { Button } from 'svelte-ux';
	import { format } from '@layerstack/utils';
	import type { TraceSpan } from '$lib/data.remote';

	const rowHeight = 24;
	const barHeight = rowHeight - 1; // leave a 1px gap between rows

	// A flame *chart* (vs. flame *graph*): the profile is a real trace, so each frame keeps its
	// actual `start`/`end` on a time axis and empty space = idle / I/O wait — unlike the aggregated,
	// space-filling flame graph.  `d3.hierarchy()` flattens the nested spans via `.descendants()`,
	// computing each frame's `depth` (and the tree `height`) for us.
	type Frame = {
		name: string;
		start: number;
		end: number;
		depth: number;
		duration: number;
		self: number;
	};

	const root = hierarchy<TraceSpan>(data);
	const frames: Frame[] = root.descendants().map((node) => ({
		name: node.data.name,
		start: node.data.start,
		end: node.data.start + node.data.duration,
		depth: node.depth,
		duration: node.data.duration,
		self: node.data.duration - (node.children ?? []).reduce((sum, c) => sum + c.data.duration, 0)
	}));
	const total = data.start + data.duration; // root span covers the whole trace

	// Overview silhouette: active stack depth over time (dips during idle gaps) — drives the brush
	const sampleCount = 300;
	const overview = Array.from({ length: sampleCount }, (_, i) => {
		const time = ((i + 0.5) * total) / sampleCount;
		let depth = 0;
		for (const f of frames) {
			if (f.start <= time && time < f.end) depth = Math.max(depth, f.depth + 1);
		}
		return { time, depth };
	});

	let mainContext = $state<ChartState>();

	// Color accessor: hash the frame name to a [0,1] value (the `Chart`'s `cScale` maps it to a
	// warm color — see the `c`/`cScale`/`cDomain` props below)
	function nameHash(name: string) {
		const maxChar = 6;
		const mod = 10;
		let hash = 0;
		let maxHash = 0;
		let weight = 1;
		for (let i = 0; i < Math.min(name.length, maxChar); i++) {
			hash += weight * (name.charCodeAt(i) % mod);
			maxHash += weight * (mod - 1);
			weight *= 0.7;
		}
		return maxHash > 0 ? hash / maxHash : 0;
	}

	export { data };
</script>

<div
	class="flex items-center justify-between text-xs text-surface-content/50 mb-1 screenshot-hidden"
>
	<span>Drag to pan · scroll to zoom · brush the overview above · gaps = idle / I/O wait</span>
	<Button
		size="sm"
		variant="fill-light"
		color="primary"
		on:click={() => mainContext?.transform.reset()}
	>
		Reset
	</Button>
</div>

<!-- Overview area — brush a time window to zoom the main chart (Chrome DevTools style) -->
<Chart
	data={overview}
	x="time"
	xDomain={[0, total]}
	y="depth"
	yDomain={[0, root.height + 1]}
	padding={{ left: 4, right: 4 }}
	brush={{
		x: mainContext?.xDomain,
		onChange: (e) => {
			if (mainContext && e.brush.active) {
				mainContext.zoomToBrush(e.brush, 'x');
			}
		},
		onBrushEnd: (e) => {
			if (mainContext && !e.brush.active) {
				mainContext.transform.reset();
			}
		}
	}}
	height={48}
	class="mb-1"
>
	<Layer>
		<Area
			curve={curveStepAfter}
			class="fill-primary/20"
			line={{ class: 'stroke-primary stroke-1' }}
		/>
	</Layer>
</Chart>

<!-- Main flame chart — frames positioned by real time via the duration model `x={['start', 'end']}` -->
<Chart
	bind:context={mainContext}
	data={frames}
	x={['start', 'end']}
	c={(d: Frame) => nameHash(d.name)}
	cScale={scaleSequential(interpolateYlOrRd)}
	cDomain={[-0.6, 1.6]}
	transform={{
		mode: 'domain',
		axis: 'x',
		scaleExtent: [1, 64],
		domainExtent: { x: { min: 0, max: total, minRange: total / 60 } }
	}}
	clip
	padding={{ left: 4, right: 4, bottom: 24 }}
	height={(root.height + 1) * rowHeight + 24}
>
	{#snippet children({ context })}
		<Layer class="cursor-grab">
			<Axis placement="bottom" rule format={(v) => `${format(v, 'integer')} ms`} />
			{#each frames as frame (frame.name + '@' + frame.start)}
				{@const x0 = context.xScale(frame.start)}
				{@const x1 = context.xScale(frame.end)}
				{@const nodeWidth = x1 - x0}
				{#if x1 > 0 && x0 < context.width && nodeWidth > 0.3}
					<!-- Pin the label to the visible-left edge and truncate at the frame's right edge
					     (or the viewport), so partially-scrolled frames stay readable -->
					{@const labelLeft = Math.max(0, -x0)}
					{@const labelRight = Math.min(nodeWidth, context.width - x0)}
					<Group
						x={x0}
						y={frame.depth * rowHeight}
						onpointermove={(e) => {
							if (!context.transform.dragging) context.tooltip.show(e, frame);
						}}
						onpointerleave={() => context.tooltip.hide()}
					>
						<Rect
							width={nodeWidth}
							height={barHeight}
							rx={2}
							fill={context.cGet(frame)}
							class="stroke-surface-200"
						/>
						{#if labelRight - labelLeft > 24}
							<RectClipPath x={labelLeft} width={labelRight - labelLeft - 4} height={barHeight}>
								<Text
									value={frame.name}
									x={labelLeft + 5}
									y={barHeight / 2}
									verticalAnchor="middle"
									class="text-[10px] fill-black pointer-events-none"
								/>
							</RectClipPath>
						{/if}
					</Group>
				{/if}
			{/each}
		</Layer>

		<Tooltip.Root>
			{#snippet children({ data })}
				<Tooltip.Header>{data.name}</Tooltip.Header>
				<Tooltip.List>
					<Tooltip.Item label="Duration" value="{format(data.duration, 'integer')} ms" />
					<Tooltip.Item label="Self" value="{format(data.self, 'integer')} ms" />
					<Tooltip.Item label="Start" value="{format(data.start, 'integer')} ms" />
				</Tooltip.List>
			{/snippet}
		</Tooltip.Root>
	{/snippet}
</Chart>
