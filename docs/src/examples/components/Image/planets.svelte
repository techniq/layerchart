<script lang="ts">
	import { scaleLog } from 'd3-scale';
	import { Chart, Image, Axis, Layer } from 'layerchart';

	const data = [
		{
			name: 'Mercury',
			distance: 57.9,
			diameter: 4879,
			image: 'https://space-facts.com/wp-content/uploads/mercury-transparent.png',
		},
		{
			name: 'Venus',
			distance: 108.2,
			diameter: 12104,
			image: 'https://space-facts.com/wp-content/uploads/venus-transparent.png',
		},
		{
			name: 'Earth',
			distance: 149.6,
			diameter: 12756,
			image: 'https://space-facts.com/wp-content/uploads/earth-transparent.png',
		},
		{
			name: 'Mars',
			distance: 228.0,
			diameter: 6792,
			image: 'https://space-facts.com/wp-content/uploads/mars-transparent.png',
		},
		{
			name: 'Jupiter',
			distance: 778.5,
			diameter: 142984,
			image: 'https://space-facts.com/wp-content/uploads/jupiter-transparent.png',
		},
		{
			name: 'Saturn',
			distance: 1432.0,
			diameter: 120536,
			image: 'https://space-facts.com/wp-content/uploads/saturn-transparent.png',
		},
		{
			name: 'Uranus',
			distance: 2867.0,
			diameter: 51118,
			image: 'https://space-facts.com/wp-content/uploads/uranus-transparent.png',
		},
		{
			name: 'Neptune',
			distance: 4515.0,
			diameter: 49528,
			image: 'https://space-facts.com/wp-content/uploads/neptune-transparent.png',
		},
	];
</script>

<Chart
	{data}
	x="distance"
	xScale={scaleLog()}
	padding={{ top: 10, bottom: 30, left: 10, right: 10 }}
	height={200}
>
	<Layer>
		<Axis placement="bottom" label="Distance from Sun (million km)" rule />
		<Image
			href="image"
			x="distance"
			y={80}
			width={(d) => Math.max(20, Math.sqrt(d.diameter / 100))}
			height={(d) => Math.max(20, Math.sqrt(d.diameter / 100))}
		/>
	</Layer>
</Chart>
