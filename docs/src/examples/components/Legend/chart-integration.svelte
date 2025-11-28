<script>
	import { Chart, Legend } from 'layerchart';
	import { scaleOrdinal } from 'd3-scale';
</script>

<Chart
	data={[{ name: 'One' }, { name: 'Two' }, { name: 'Three' }]}
	c="name"
	cScale={scaleOrdinal()}
	cRange={['var(--color-success)', 'var(--color-warning)', 'var(--color-danger)']}
	height={40}
>
	<Legend title="I am Legend" />
</Chart>
