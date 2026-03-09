<script lang="ts">
	import { forceX, forceY, forceCollide, type SimulationNodeDatum } from 'd3-force';
	import {
		Chart,
		Circle,
		CircleClipPath,
		ForceSimulation,
		Group,
		Layer,
		Tooltip
	} from 'layerchart';
	import Trophy from '~icons/lucide/trophy';
	import type { Prettify } from '@layerstack/utils';

	type SponsorTier = {
		sponsor: { username: string; avatar: string; link?: string }[];
		level: string;
	};

	let {
		people,
		targetFillRatio = 0.7,
		radiusScale = 15
	}: { people: SponsorTier[]; targetFillRatio?: number; radiusScale?: number } = $props();

	type Node = {
		username: string;
		avatar: string;
		link?: string;
		level?: string;
		tierColor?: string;
		strokeColor?: string;
		value?: number;
		placeholder?: boolean;
	};

	type SimNode = Prettify<Node & SimulationNodeDatum & { r: number; baseR: number; idx: number }>;

	const tierColors: Record<string, string> = {
		'Gold Level': '#FFD700',
		'Silver Level': '#A8A8A8',
		'Bronze Level': '#CD7F32',
		'Backers Level': '#22C55E',
		'Past Sponsors': 'rgba(136,136,136,0.2)'
	};

	const tierValues: Record<string, number> = {
		'Gold Level': 16,
		'Silver Level': 8,
		'Bronze Level': 4,
		'Backers Level': 3,
		'Past Sponsors': 1
	};

	// svelte-ignore state_referenced_locally
	const allNodes: Node[] = people.flatMap((tier) =>
		tier.sponsor.map((s) => ({
			...s,
			level: tier.level,
			tierColor: tierColors[tier.level],
			value: tierValues[tier.level] ?? 1
		}))
	);

	const totalRealValue = allNodes.reduce((sum, s) => sum + (s.value ?? 0), 0);
	const placeholderCount = Math.ceil(totalRealValue / targetFillRatio - totalRealValue);
	for (let i = 0; i < placeholderCount; i++) {
		allNodes.push({
			username: `placeholder-${i}`,
			avatar: '',
			level: 'Past Sponsors',
			tierColor: 'transparent',
			strokeColor: 'rgba(136,136,136,0.2)',
			value: 1,
			placeholder: true
		});
	}

	const simNodes: SimNode[] = allNodes.map((s, i) => ({
		...s,
		idx: i,
		baseR: Math.sqrt(s.value ?? 1) * radiusScale,
		r: Math.sqrt(s.value ?? 1) * radiusScale
	}));

	let hoveredIdx = $state<number | null>(null);

	const totalCircleArea = simNodes.reduce((sum, n) => sum + Math.PI * n.baseR * n.baseR, 0);
	const packingEfficiency = 0.65;
	const boundaryRadius = Math.sqrt(totalCircleArea / (Math.PI * packingEfficiency));

	function forceBoundary() {
		let nodes: SimNode[] = [];
		const force = () => {
			for (const node of nodes) {
				const x = node.x ?? 0;
				const y = node.y ?? 0;
				const dist = Math.sqrt(x * x + y * y);
				const maxDist = boundaryRadius - node.r;
				if (dist > maxDist && dist > 0) {
					const scale = maxDist / dist;
					node.x = x * scale;
					node.y = y * scale;
					node.vx = (node.vx ?? 0) * 0.5;
					node.vy = (node.vy ?? 0) * 0.5;
				}
			}
		};
		force.initialize = (n: SimNode[]) => {
			nodes = n;
		};
		return force;
	}

	const xForce = forceX<SimNode>().strength(0.05);
	const yForce = forceY<SimNode>().strength(0.05);

	const forces = $derived.by(() => {
		const _dep = hoveredIdx;
		return {
			x: xForce,
			y: yForce,
			collide: forceCollide<SimNode>()
				.radius((d) => d.r + 2)
				.iterations(6),
			boundary: forceBoundary()
		};
	});

	const hoverScale = 1.4;

	function handleHover(idx: number) {
		hoveredIdx = idx;
		for (const node of simNodes) {
			node.r = node.idx === idx ? node.baseR * hoverScale : node.baseR;
		}
	}

	function handleHoverEnd() {
		hoveredIdx = null;
		for (const node of simNodes) {
			node.r = node.baseR;
		}
	}
</script>

<Chart width={Math.ceil(boundaryRadius * 2) + 20} height={Math.ceil(boundaryRadius * 2) + 20}>
	{#snippet children({ context })}
		<ForceSimulation
			data={{ nodes: simNodes }}
			alphaTarget={hoveredIdx !== null ? 0.5 : 0}
			velocityDecay={0.2}
			{forces}
		>
			{#snippet children({ nodes })}
				<Layer type="svg">
					<Group center>
						<Circle r={boundaryRadius} fill="var(--color-surface-content)" fillOpacity={0.06} />
						{#each nodes as node, i}
							<!-- svelte-ignore a11y_no_static_element_interactions -->
							<g
								onpointerenter={() => !node.placeholder && handleHover(node.idx)}
								onpointermove={(e) => !node.placeholder && context.tooltip.show(e, node)}
								onpointerleave={() => {
									if (!node.placeholder) {
										handleHoverEnd();
										context.tooltip.hide();
									}
								}}
								class="{!node.placeholder
									? 'cursor-pointer'
									: ''} transition-transform duration-250 ease-out {hoveredIdx === node.idx
									? 'scale-[1.4]'
									: ''}"
								style="transform-origin: {node.x}px {node.y}px"
							>
								{#if node.avatar && !node.placeholder}
									<CircleClipPath
										id="avatar-clip-{node.idx}"
										cx={node.x}
										cy={node.y}
										r={node.baseR}
									>
										{#if node.link}
											<a href={node.link} target="_blank" title={node.username}>
												{@render AvatarImage(node)}
											</a>
										{:else}
											{@render AvatarImage(node)}
										{/if}
									</CircleClipPath>
								{/if}
								<Circle
									cx={node.x}
									cy={node.y}
									r={node.placeholder ? node.r : node.baseR}
									fill={node.placeholder ? (node.tierColor ?? '') : 'none'}
									fillOpacity={node.placeholder ? 0.9 : 1}
									stroke={node.placeholder
										? (node.strokeColor ?? 'rgba(0,0,0,0.15)')
										: (node.tierColor ?? 'rgba(0,0,0,0.15)')}
									strokeWidth={node.placeholder ? 1 : 2}
								/>
							</g>
						{/each}
					</Group>
				</Layer>
			{/snippet}
		</ForceSimulation>

		<Tooltip.Root>
			{#snippet children({ data })}
				<Tooltip.Header class="text-lg"
					><Trophy class="w-4 h-4" style="color: {data.tierColor};" />
					{data.level} Sponsor</Tooltip.Header
				>
				<Tooltip.List>
					<Tooltip.Item label="" value={data.username} class="flex! justify-center!" />
				</Tooltip.List>
			{/snippet}
		</Tooltip.Root>
	{/snippet}
</Chart>

{#snippet AvatarImage(node: any)}
	<image
		href={node.avatar}
		x={(node.x ?? 0) - node.baseR}
		y={(node.y ?? 0) - node.baseR}
		width={node.baseR * 2}
		height={node.baseR * 2}
		preserveAspectRatio="xMidYMid slice"
	/>
{/snippet}
