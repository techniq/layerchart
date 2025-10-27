<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import { curveLinear } from 'd3-shape';
	import { cubicOut } from 'svelte/easing';
	import { slide } from 'svelte/transition';
	import { cls } from '@layerstack/tailwind';
	import { Chart, Dagre, Group, Layer, Rect, Spline, Text } from 'layerchart';
	import { Field, Switch, Toggle } from 'svelte-ux';
	import DagreControls from '$lib/components/DagreControls.svelte';
	import TransformControls from '$lib/components/TransformControls.svelte';

	let { data } = $props();

	let settings = $state({
		ranker: 'network-simplex',
		direction: 'top-bottom',
		align: 'none',
		nodeSeparation: 50,
		rankSeparation: 50,
		edgeSeparation: 10,
		edgeLabelPosition: 'center',
		edgeLabelOffset: 10,
		curve: curveLinear,
		arrow: 'triangle'
	}) satisfies ComponentProps<typeof DagreControls>['settings'];

	export { data };
</script>

<Toggle let:on={showSettings} let:toggle>
	<div class="grid grid-cols-[1fr_auto] gap-2 items-end">
		<Field label="Settings" labelPlacement="left" class="mb-1" let:id>
			<Switch checked={showSettings} on:change={toggle} {id} size="md" />
		</Field>
	</div>

	<div class="flex gap-2">
		<div class="flex-1 h-[700px] p-4 border rounded-sm overflow-hidden">
			<Chart
				transform={{
					mode: 'canvas',
					initialScale: 0.75,
					initialTranslate: { x: 0, y: -110 },
					initialScrollMode: 'scale',
					motion: { type: 'tween', duration: 800, easing: cubicOut }
				}}
			>
				<TransformControls />

				<Layer>
					<Dagre data={data.tcpState} edges={(d) => d.links} {...settings}>
						{#snippet children({ nodes, edges })}
							<g class="edges">
								{#each edges as edge, i (edge.v + '-' + edge.w)}
									<Spline
										data={edge.points}
										x="x"
										y="y"
										class="stroke-surface-content opacity-30"
										motion="tween"
										curve={settings?.curve}
										markerEnd={settings.arrow}
									/>

									<Text
										value={edge.label}
										x={edge.x}
										y={edge.y}
										textAnchor="middle"
										verticalAnchor="middle"
										class="stroke-2 stroke-surface-100"
										motion="tween"
									/>
								{/each}
							</g>

							<g class="nodes">
								{#each nodes as node (node.label)}
									<Group x={node.x - node.width / 2} y={node.y - node.height / 2} motion="tween">
										<Rect
											width={node.width}
											height={node.height}
											class={cls(
												'fill-surface-200 stroke-2 stroke-primary/50',
												node.label === 'CLOSED' && 'fill-danger/10 stroke-danger/50',
												node.label === 'ESTAB' && 'fill-success/10 stroke-success/50'
											)}
											rx={10}
										/>

										<Text
											value={node.label}
											x={node.width / 2}
											y={node.height / 2}
											dy={-2}
											textAnchor="middle"
											verticalAnchor="middle"
											class={cls('text-xs pointer-events-none')}
										/>
									</Group>
								{/each}
							</g>
						{/snippet}
					</Dagre>
				</Layer>
			</Chart>
		</div>

		{#if showSettings}
			<div transition:slide={{ axis: 'x' }}>
				<DagreControls bind:settings />
			</div>
		{/if}
	</div>
</Toggle>
