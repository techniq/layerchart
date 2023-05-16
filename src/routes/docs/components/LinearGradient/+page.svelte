<script lang="ts">
	import { ApiDocs } from 'svelte-ux';

	import api from '$lib/components/LinearGradient.svelte?raw&sveld';

	import Chart, { Svg } from '$lib/components/Chart.svelte';

	import Arc from '$lib/components/Arc.svelte';
	import LinearGradient from '$lib/components/LinearGradient.svelte';

	import Preview from '$lib/docs/Preview.svelte';
</script>

<h1>Examples</h1>

<h2>Direction and custom colors</h2>

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
				{#each { length: 3 } as _, i}
					<rect
						x={0 + i * 120}
						y={0}
						width={100}
						height={300}
						rx={8}
						fill="url(#gradient-{i + 1})"
					/>
				{/each}
			</Svg>
		</Chart>
	</div>
</Preview>

<h2>Tailwind colors</h2>

<Preview>
	<div class="h-[334px] p-4 border rounded">
		<Chart>
			<Svg>
				<LinearGradient id="tw-1" from to class="from-pink-500 to-yellow-500" vertical />
				<LinearGradient id="tw-2" from to class="from-green-300 to-purple-600" vertical />
				<LinearGradient id="tw-3" from to class="from-gray-600 to-black" vertical />
				<LinearGradient id="tw-4" from to class="from-pink-300 to-indigo-400" vertical />
				<LinearGradient id="tw-5" from to class="from-yellow-100 to-yellow-500" vertical />
				<LinearGradient id="tw-6" from to class="from-blue-700 to-gray-900" vertical />
				<LinearGradient id="tw-7" from to class="from-sky-300 to-blue-500" vertical />
				<LinearGradient id="tw-8" from to class="from-red-500 to-red-800" vertical />
				<LinearGradient id="tw-9" from to class="from-blue-400 to-emerald-400" vertical />
				{#each { length: 9 } as _, i}
					<rect x={0 + i * 120} y={0} width={100} height={300} rx={8} fill="url(#tw-{i + 1})" />
				{/each}
			</Svg>
		</Chart>
	</div>
</Preview>

<h1>API</h1>

<ApiDocs {api} />
