<script lang="ts">
	import { ApiDocs } from 'svelte-ux';

	import api from '$lib/components/Pattern.svelte?raw&sveld';

	import Chart, { Svg } from '$lib/components/Chart.svelte';

	import LinearGradient from '$lib/components/LinearGradient.svelte';
	import Pattern from '$lib/components/Pattern.svelte';

	import Preview from '$lib/docs/Preview.svelte';
</script>

<h1>Examples</h1>

<h2>Lines</h2>

<Preview>
	<div class="h-[334px] p-4 border rounded">
		<Chart>
			<Svg>
				<Pattern id="line-pattern-1" width={4} height={4}>
					<line x2="100%" stroke="black" />
				</Pattern>
				<Pattern id="line-pattern-2" width={4} height={4}>
					<line y2="100%" stroke="black" />
				</Pattern>
				<Pattern id="line-pattern-3" width={4} height={4}>
					<line x2="100%" stroke="black" />
					<line y2="100%" stroke="black" />
				</Pattern>
				<Pattern id="line-pattern-4" width={8} height={8}>
					<line x1={8} y2={8} stroke="black" />
				</Pattern>
				<Pattern id="line-pattern-5" width={8} height={8}>
					<line x2={8} y2={8} stroke="black" />
				</Pattern>
				<Pattern id="line-pattern-6" width={8} height={8}>
					<line x1={8} y2={8} stroke="black" />
					<line x2={8} y2={8} stroke="black" />
				</Pattern>
				{#each { length: 6 } as _, i}
					<rect
						x={0 + i * 120}
						y={0}
						width={100}
						height={300}
						rx={8}
						fill="url(#line-pattern-{i + 1})"
						stroke="black"
					/>
				{/each}
			</Svg>
		</Chart>
	</div>
</Preview>

<h2>Circles</h2>

<Preview>
	<div class="h-[334px] p-4 border rounded">
		<Chart>
			<Svg>
				<Pattern id="circle-pattern-1" width={4} height={4}>
					<circle cx={2} cy={2} r={1} />
				</Pattern>
				<Pattern id="circle-pattern-2" width={8} height={8}>
					<circle cx={4} cy={4} r={1} />
				</Pattern>
				<Pattern id="circle-pattern-3" width={8} height={8}>
					<circle cx={4} cy={4} r={2} />
				</Pattern>
				<Pattern id="circle-pattern-4" width={8} height={8}>
					<circle cx={4} cy={4} r={2} />
					<circle cx={0} cy={0} r={2} />
					<circle cx={0} cy={8} r={2} />
					<circle cx={8} cy={0} r={2} />
					<circle cx={8} cy={8} r={2} />
				</Pattern>
				<Pattern id="circle-pattern-5" width={8} height={8}>
					<circle cx={4} cy={4} r={1} />
					<circle cx={0} cy={0} r={1} />
					<circle cx={0} cy={8} r={1} />
					<circle cx={8} cy={0} r={1} />
					<circle cx={8} cy={8} r={1} />
				</Pattern>
				<Pattern id="circle-pattern-6" width={8} height={8}>
					<circle cx={4} cy={4} r={2} fill="#0003" />
				</Pattern>
				{#each { length: 6 } as _, i}
					<rect
						x={0 + i * 120}
						y={0}
						width={100}
						height={300}
						rx={8}
						fill="url(#circle-pattern-{i + 1})"
						stroke="black"
					/>
				{/each}
			</Svg>
		</Chart>
	</div>
</Preview>

<h2>With Fill color</h2>

<Preview>
	<div class="h-[334px] p-4 border rounded">
		<Chart>
			<Svg>
				<Pattern id="fill-pattern-1" width={4} height={4}>
					<rect width={4} height={4} fill="hsl(20 100% 50%)" />
					<circle cx={2} cy={2} r={1} fill="#fff4" />
				</Pattern>
				<Pattern id="fill-pattern-2" width={8} height={8}>
					<rect width={8} height={8} fill="hsl(150 100% 45%)" />
					<circle cx={4} cy={4} r={1} fill="#fff9" />
				</Pattern>
				<Pattern id="fill-pattern-3" width={8} height={8}>
					<rect width={8} height={8} fill="hsl(210 100% 50%)" />
					<circle cx={4} cy={4} r={1} fill="#fff9" />
					<circle cx={0} cy={0} r={1} fill="#fff9" />
					<circle cx={0} cy={8} r={1} fill="#fff9" />
					<circle cx={8} cy={0} r={1} fill="#fff9" />
					<circle cx={8} cy={8} r={1} fill="#fff9" />
				</Pattern>
				<Pattern id="fill-pattern-4" width={8} height={8}>
					<rect width={8} height={8} fill="hsl(260 100% 50%)" />
					<circle cx={4} cy={4} r={2} fill="#fff9" />
					<circle cx={0} cy={0} r={2} fill="#fff9" />
					<circle cx={0} cy={8} r={2} fill="#fff9" />
					<circle cx={8} cy={0} r={2} fill="#fff9" />
					<circle cx={8} cy={8} r={2} fill="#fff9" />
				</Pattern>
				<Pattern id="fill-pattern-5" width={4} height={4}>
					<rect width={4} height={4} fill="hsl(40 100% 50%)" />
					<line x2="100%" stroke="#fff9" />
				</Pattern>
				<Pattern id="fill-pattern-6" width={4} height={4}>
					<rect width={4} height={4} fill="hsl(360 100% 40%)" />
					<line x2="100%" stroke="#0003" />
					<line y2="100%" stroke="#0003" />
				</Pattern>
				{#each { length: 6 } as _, i}
					<rect
						x={0 + i * 120}
						y={0}
						width={100}
						height={300}
						rx={8}
						fill="url(#fill-pattern-{i + 1})"
					/>
				{/each}
			</Svg>
		</Chart>
	</div>
</Preview>

<h2>With LinearGradient</h2>

<Preview>
	<div class="h-[334px] p-4 border rounded">
		<Chart>
			<Svg>
				<LinearGradient id="gradient-1" from="hsl(60 100% 50%)" to="hsl(30 100% 40%)" />
				<LinearGradient
					id="gradient-2"
					from="hsl(60 100% 50%)"
					to="hsl(140 100% 40%)"
					rotate={45}
				/>
				<LinearGradient id="gradient-3" from="hsl(195 100% 50%)" to="hsl(270 100% 30%)" vertical />
				<LinearGradient id="gradient-4" from="hsl(60 100% 50%)" to="hsl(30 100% 40%)" />
				<LinearGradient
					id="gradient-5"
					from="hsl(60 100% 50%)"
					to="hsl(140 100% 40%)"
					rotate={45}
				/>
				<LinearGradient id="gradient-6" from="hsl(195 100% 50%)" to="hsl(270 100% 30%)" vertical />
				<Pattern id="gradient-with-pattern-1" width={4} height={4}>
					<circle cx={2} cy={2} r={1} fill="#fff9" />
				</Pattern>
				<Pattern id="gradient-with-pattern-2" width={8} height={8}>
					<circle cx={4} cy={4} r={1} fill="#fff9" />
				</Pattern>
				<Pattern id="gradient-with-pattern-3" width={8} height={8}>
					<circle cx={4} cy={4} r={1} fill="#fff9" />
					<circle cx={0} cy={0} r={1} fill="#fff9" />
					<circle cx={0} cy={8} r={1} fill="#fff9" />
					<circle cx={8} cy={0} r={1} fill="#fff9" />
					<circle cx={8} cy={8} r={1} fill="#fff9" />
				</Pattern>
				<Pattern id="gradient-with-pattern-4" width={8} height={8}>
					<circle cx={4} cy={4} r={2} fill="#fff9" />
					<circle cx={0} cy={0} r={2} fill="#fff9" />
					<circle cx={0} cy={8} r={2} fill="#fff9" />
					<circle cx={8} cy={0} r={2} fill="#fff9" />
					<circle cx={8} cy={8} r={2} fill="#fff9" />
				</Pattern>
				<Pattern id="gradient-with-pattern-5" width={4} height={4}>
					<line x2="100%" stroke="#fff9" />
				</Pattern>
				<Pattern id="gradient-with-pattern-6" width={4} height={4}>
					<line x2="100%" stroke="#0003" />
					<line y2="100%" stroke="#0003" />
				</Pattern>
				{#each { length: 6 } as _, i}
					<rect
						x={0 + i * 120}
						y={0}
						width={100}
						height={300}
						rx={8}
						fill="url(#gradient-{i + 1})"
					/>
					<rect
						x={0 + i * 120}
						y={0}
						width={100}
						height={300}
						rx={8}
						fill="url(#gradient-with-pattern-{i + 1})"
					/>
				{/each}
			</Svg>
		</Chart>
	</div>
</Preview>

<h2>LinearGradient as Pattern</h2>

<Preview>
	<div class="h-[334px] p-4 border rounded">
		<Chart>
			<Svg>
				<LinearGradient id="gradient-1" from="hsl(60 100% 50%)" to="hsl(30 100% 40%)" />
				<LinearGradient
					id="gradient-2"
					from="hsl(60 100% 50%)"
					to="hsl(140 100% 40%)"
					rotate={45}
				/>
				<LinearGradient id="gradient-3" from="hsl(195 100% 50%)" to="hsl(270 100% 30%)" vertical />
				<Pattern id="gradient-pattern-1" width={4} height={4}>
					<rect width={4} height={4} fill="url(#gradient-1)" /></Pattern
				>
				<Pattern id="gradient-pattern-2" width={4} height={4}>
					<rect width={4} height={4} fill="url(#gradient-2)" /></Pattern
				>
				<Pattern id="gradient-pattern-3" width={4} height={4}>
					<rect width={4} height={4} fill="url(#gradient-3)" /></Pattern
				>
				<Pattern id="gradient-pattern-4" width={8} height={8}>
					<rect width={8} height={8} fill="url(#gradient-1)" /></Pattern
				>
				<Pattern id="gradient-pattern-5" width={8} height={8}>
					<rect width={8} height={8} fill="url(#gradient-2)" /></Pattern
				>
				{#each { length: 5 } as _, i}
					<rect
						x={0 + i * 120}
						y={0}
						width={100}
						height={300}
						rx={8}
						fill="url(#gradient-pattern-{i + 1})"
					/>
				{/each}
			</Svg>
		</Chart>
	</div>
</Preview>

<h1>API</h1>

<ApiDocs {api} />
