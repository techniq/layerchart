<script lang="ts">
	import { PieChart } from 'layerchart';
	import { fruitColors } from '$lib/utils/fruits';
	import { longData } from '$lib/utils/data';

	const data = longData.filter((d) => d.year === 2019);
	export { data };
</script>

<PieChart
	{data}
	key="fruit"
	value="value"
	cRange={fruitColors}
	label={(d) => {
		switch (d.fruit) {
			case 'apples':
				return 'Apples 🍏';
			case 'bananas':
				return 'Bananas 🍌';
			case 'cherries':
				return 'Cherries 🍒';
			case 'grapes':
				return 'Grapes 🍇';
		}
	}}
	height={300}
	legend
/>
