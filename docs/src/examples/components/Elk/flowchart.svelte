<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import { curveLinear } from 'd3-shape';
	import { cubicOut } from 'svelte/easing';
	import { slide } from 'svelte/transition';
	import { cls } from '@layerstack/tailwind';
	import { Chart, Group, Layer, Rect, Spline, Text } from 'layerchart';
	import { Elk } from 'layerchart/graph';
	import ElkControls from '$lib/components/controls/ElkControls.svelte';
	import ElkSettingsControls from '$lib/components/controls/ElkSettingsControls.svelte';
	import TransformContextControls from '$lib/components/controls/TransformContextControls.svelte';

	// Mermaid-style flowchart of a CI/CD pipeline
	const data = {
		nodes: [
			{ id: 'commit', label: 'git commit', kind: 'start' },
			{ id: 'lint', label: 'Lint' },
			{ id: 'test', label: 'Run tests' },
			{ id: 'pass', label: 'All tests pass?', kind: 'decision' },
			{ id: 'build', label: 'Build artifact' },
			{ id: 'staging', label: 'Deploy → staging' },
			{ id: 'smoke', label: 'Smoke tests OK?', kind: 'decision' },
			{ id: 'prod', label: 'Promote → production' },
			{ id: 'notify', label: 'Notify team', kind: 'end' },
			{ id: 'rollback', label: 'Rollback', kind: 'error' },
			{ id: 'fail', label: 'Mark build failed', kind: 'error' }
		],
		edges: [
			{ source: 'commit', target: 'lint' },
			{ source: 'lint', target: 'test' },
			{ source: 'test', target: 'pass' },
			{ source: 'pass', target: 'build', label: 'yes' },
			{ source: 'pass', target: 'fail', label: 'no' },
			{ source: 'build', target: 'staging' },
			{ source: 'staging', target: 'smoke' },
			{ source: 'smoke', target: 'prod', label: 'yes' },
			{ source: 'smoke', target: 'rollback', label: 'no' },
			{ source: 'prod', target: 'notify' },
			{ source: 'rollback', target: 'notify' },
			{ source: 'fail', target: 'notify' }
		]
	};

	let settings = $state({
		algorithm: 'layered',
		direction: 'down',
		edgeRouting: 'orthogonal',
		nodePlacementStrategy: 'network-simplex',
		hierarchyHandling: 'include-children',
		nodeNodeSpacing: 30,
		edgeEdgeSpacing: 10,
		edgeNodeSpacing: 20,
		layerSpacing: 60,
		componentSpacing: 40,
		separateConnectedComponents: true,
		curve: curveLinear,
		arrow: 'triangle'
	}) satisfies ComponentProps<typeof ElkControls>['settings'];

	let showSettings = $state(false);
</script>

<ElkSettingsControls bind:showSettings />

<div class="flex gap-2">
	<Chart
		transform={{
			mode: 'canvas',
			scrollMode: 'scale',
			motion: { type: 'tween', duration: 800, easing: cubicOut }
		}}
		clip
		height={700}
	>
		<TransformContextControls />

		<Layer>
			<Elk data={data as any} nodeWidth={150} {...settings}>
				{#snippet children({ nodes, edges })}
					<g class="edges">
						{#each edges as edge (edge.id)}
							<Spline
								data={edge.points}
								x="x"
								y="y"
								class="stroke-surface-content opacity-40"
								motion="tween"
								curve={settings.curve}
								markerEnd={settings.arrow}
							/>

							{#if edge.label}
								<Text
									value={edge.label}
									x={edge.x}
									y={edge.y}
									textAnchor="middle"
									verticalAnchor="middle"
									class={cls(
										'stroke-3 stroke-surface-100 text-[10px] font-medium',
										edge.label === 'yes' && 'fill-success-600',
										edge.label === 'no' && 'fill-danger-600'
									)}
									motion="tween"
								/>
							{/if}
						{/each}
					</g>

					<g class="nodes">
						{#each nodes as node (node.id)}
							{@const meta = data.nodes.find((n) => n.id === node.id)}
							<Group x={node.x0} y={node.y0} motion="tween">
								<Rect
									width={node.width}
									height={node.height}
									class={cls(
										'stroke-2',
										meta?.kind === 'start' && 'fill-success/15 stroke-success/60',
										meta?.kind === 'decision' && 'fill-warning/15 stroke-warning/60',
										meta?.kind === 'error' && 'fill-danger/15 stroke-danger/60',
										meta?.kind === 'end' && 'fill-info/15 stroke-info/60',
										!meta?.kind && 'fill-surface-200 stroke-primary/50'
									)}
									rx={meta?.kind === 'decision' ? node.height / 2 : 8}
								/>

								<Text
									value={node.label}
									x={node.width / 2}
									y={node.height / 2}
									dy={-2}
									textAnchor="middle"
									verticalAnchor="middle"
									class="text-xs pointer-events-none"
								/>
							</Group>
						{/each}
					</g>
				{/snippet}
			</Elk>
		</Layer>
	</Chart>

	{#if showSettings}
		<div transition:slide={{ axis: 'x' }}>
			<ElkControls bind:settings />
		</div>
	{/if}
</div>
