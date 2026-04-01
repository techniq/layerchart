<script lang="ts">
	import { Chart, Image, Axis, Layer } from 'layerchart';

	const data = [
		{ country: 'United States', code: 'us', gdpPerCapita: 76330, lifeExpectancy: 77.2 },
		{ country: 'Germany', code: 'de', gdpPerCapita: 51204, lifeExpectancy: 80.6 },
		{ country: 'Japan', code: 'jp', gdpPerCapita: 33815, lifeExpectancy: 84.8 },
		{ country: 'Brazil', code: 'br', gdpPerCapita: 8918, lifeExpectancy: 72.8 },
		{ country: 'India', code: 'in', gdpPerCapita: 2389, lifeExpectancy: 67.2 },
		{ country: 'Nigeria', code: 'ng', gdpPerCapita: 2066, lifeExpectancy: 52.7 },
		{ country: 'Australia', code: 'au', gdpPerCapita: 64491, lifeExpectancy: 83.3 },
		{ country: 'South Korea', code: 'kr', gdpPerCapita: 32255, lifeExpectancy: 83.7 },
		{ country: 'Mexico', code: 'mx', gdpPerCapita: 10046, lifeExpectancy: 70.2 },
		{ country: 'France', code: 'fr', gdpPerCapita: 44408, lifeExpectancy: 82.5 },
	];
</script>

<Chart
	{data}
	x="gdpPerCapita"
	y="lifeExpectancy"
	yNice
	padding={{ top: 20, bottom: 30, left: 36, right: 20 }}
	height={300}
>
	<Layer>
		<Axis placement="bottom" label="GDP per capita (USD)" rule />
		<Axis placement="left" label="Life expectancy (years)" rule />
		<Image
			href={(d) => `https://flagcdn.com/w80/${d.code}.png`}
			x="gdpPerCapita"
			y="lifeExpectancy"
			r={14}
			preserveAspectRatio="xMidYMid slice"
		/>
	</Layer>
</Chart>
