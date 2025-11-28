<script lang="ts">
	import { Chart, Circle, Layer, RadialGradient } from 'layerchart';

	const radius = 50;
</script>

<Chart height={220}>
	<Layer>
		<RadialGradient id="tw-1" class="from-pink-500 to-yellow-500" />
		<RadialGradient id="tw-2" class="from-green-300 to-purple-600" />
		<RadialGradient id="tw-3" class="from-gray-600 to-black" />
		<RadialGradient id="tw-4" class="from-pink-300 to-indigo-400" />
		<RadialGradient id="tw-5" class="from-yellow-100 to-yellow-500" />
		<RadialGradient id="tw-6" class="from-blue-700 to-gray-900" />
		<RadialGradient id="tw-7" class="from-sky-300 to-blue-500" />
		<RadialGradient id="tw-8" class="from-red-500 to-red-800" />
		<RadialGradient id="tw-9" class="from-blue-400 to-emerald-400" />
		{#each { length: 9 } as _, i}
			<Circle
				cx={radius + 120 * (i % 5)}
				cy={radius + 120 * Math.floor(i / 5)}
				r={radius}
				fill="url(#tw-{i + 1})"
			/>
		{/each}
	</Layer>
</Chart>
