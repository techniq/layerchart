<script lang="ts">
	import { Axis, Chart, Ellipse, Layer } from 'layerchart';
</script>

<Chart
	xDomain={[0, 100]}
	yDomain={[0, 100]}
	padding={{ top: 10, bottom: 20, left: 24, right: 10 }}
	height={300}
>
	<Layer>
		<Axis placement="bottom" rule />
		<Axis placement="left" rule />
		<Ellipse cx={100} cy={100} rx={20} ry={10} fill="var(--color-surface-content)" />
		<Ellipse cx={200} cy={200} rx={20} ry={10} fill="var(--color-primary)" />
		<Ellipse cx={200} cy={50} rx={20} ry={10} fill="var(--color-secondary)" />
		<Ellipse
			cx={300}
			cy={150}
			rx={20}
			ry={10}
			stroke="var(--color-primary)"
			strokeWidth={2}
			fill="var(--color-primary)"
			fillOpacity={0.1}
		/>
	</Layer>
</Chart>
