<script lang="ts">
	import { Chart, Layer, LinearGradient, Rect } from 'layerchart';
</script>

<Chart height={300}>
	<Layer>
		<LinearGradient class="from-pink-500 to-yellow-500" vertical>
			{#snippet children({ gradient })}
				<Rect x={120 * 0} y={0} width={100} height={300} rx={8} fill={gradient} />
			{/snippet}
		</LinearGradient>

		<LinearGradient class="from-green-300 to-purple-600" vertical>
			{#snippet children({ gradient })}
				<Rect x={120 * 1} y={0} width={100} height={300} rx={8} fill={gradient} />
			{/snippet}
		</LinearGradient>

		<LinearGradient class="from-gray-600 to-black" vertical>
			{#snippet children({ gradient })}
				<Rect x={120 * 2} y={0} width={100} height={300} rx={8} fill={gradient} />
			{/snippet}
		</LinearGradient>

		<LinearGradient class="from-pink-300 to-indigo-400" vertical>
			{#snippet children({ gradient })}
				<Rect x={120 * 3} y={0} width={100} height={300} rx={8} fill={gradient} />
			{/snippet}
		</LinearGradient>

		<LinearGradient class="from-yellow-100 to-yellow-500" vertical>
			{#snippet children({ gradient })}
				<Rect x={120 * 4} y={0} width={100} height={300} rx={8} fill={gradient} />
			{/snippet}
		</LinearGradient>

		<LinearGradient class="from-blue-700 to-gray-900" vertical>
			{#snippet children({ gradient })}
				<Rect x={120 * 5} y={0} width={100} height={300} rx={8} fill={gradient} />
			{/snippet}
		</LinearGradient>

		<LinearGradient class="from-sky-300 to-blue-500" vertical>
			{#snippet children({ gradient })}
				<Rect x={120 * 6} y={0} width={100} height={300} rx={8} fill={gradient} />
			{/snippet}
		</LinearGradient>

		<LinearGradient class="from-red-500 to-red-800" vertical>
			{#snippet children({ gradient })}
				<Rect x={120 * 7} y={0} width={100} height={300} rx={8} fill={gradient} />
			{/snippet}
		</LinearGradient>

		<LinearGradient class="from-blue-400 to-emerald-400" vertical>
			{#snippet children({ gradient })}
				<Rect x={120 * 8} y={0} width={100} height={300} rx={8} fill={gradient} />
			{/snippet}
		</LinearGradient>
	</Layer>
</Chart>
