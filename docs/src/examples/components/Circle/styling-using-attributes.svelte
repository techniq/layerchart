<script lang="ts">
	import { Axis, Chart, Circle, Layer } from 'layerchart';
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
		<Circle cx={100} cy={100} r={20} fill="var(--color-surface-content)" />
		<Circle cx={200} cy={200} r={20} fill="var(--color-primary)" />
		<Circle cx={200} cy={50} r={20} fill="var(--color-secondary)" />
		<Circle
			cx={300}
			cy={150}
			r={20}
			stroke="var(--color-primary)"
			strokeWidth={2}
			fill="var(--color-primary)"
			fillOpacity={0.1}
		/>
	</Layer>
</Chart>
