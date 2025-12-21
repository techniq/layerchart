<script lang="ts">
	import { PieChart } from 'layerchart';

	const data = [
		{
			fruit: 'apples',
			color: 'var(--color-apples)',
			value: 60
		},
		{
			fruit: 'bananas',
			color: 'var(--color-bananas)',
			value: 512
		},
		{
			fruit: 'cherries',
			color: 'var(--color-cherries)',
			value: 764
		},
		{
			fruit: 'grapes',
			color: 'var(--color-grapes)',
			value: 400
		}
	];
</script>

<PieChart {data} key="fruit" value="value" c="color" height={300} />
