<script lang="ts">
	import { Arc, Chart, WebGL, perspective } from '@layerchart/webgl';

	const data = {
		values: [
			{ value: 400, domain: [0, 1000], fillClass: 'fill-red-500', trackClass: 'fill-red-500/10' },
			{ value: 20, domain: [0, 30], fillClass: 'fill-lime-400', trackClass: 'fill-lime-400/10' },
			{ value: 10, domain: [0, 12], fillClass: 'fill-cyan-400', trackClass: 'fill-cyan-500/10' }
		]
	};

	export { data };
</script>

<!-- LayerChart's concentric gauges, props and classes unchanged, each ring standing 12px tall -->
<Chart
	view={perspective({ rotate: 0, tilt: 50 })}
	transform={{ mode: 'canvas', drag: 'rotate', scrollMode: 'scale', scrollActivationKey: 'shift' }}
	height={300}
	padding={20}
>
	<WebGL>
		<Arc
			value={400}
			domain={[0, 1000]}
			innerRadius={-20}
			cornerRadius={10}
			z={12}
			class="fill-red-500"
			track={{ class: 'fill-red-500/10' }}
		/>
		<Arc
			value={20}
			domain={[0, 30]}
			outerRadius={-25}
			innerRadius={-20}
			cornerRadius={10}
			z={12}
			class="fill-lime-400"
			track={{ class: 'fill-lime-400/10' }}
		/>
		<Arc
			value={10}
			domain={[0, 12]}
			outerRadius={-50}
			innerRadius={-20}
			cornerRadius={10}
			z={12}
			class="fill-cyan-400"
			track={{ class: 'fill-cyan-500/10' }}
		/>
	</WebGL>
</Chart>
