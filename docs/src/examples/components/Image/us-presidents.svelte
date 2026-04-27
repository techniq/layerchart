<script lang="ts">
	import { Chart, Image, Axis, Layer } from 'layerchart';

	const data = [
		{
			name: 'George Washington',
			inauguration: new Date('1789-04-30'),
			rating: 90,
			portrait:
				'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Gilbert_Stuart_Williamstown_Portrait_of_George_Washington.jpg/250px-Gilbert_Stuart_Williamstown_Portrait_of_George_Washington.jpg'
		},
		{
			name: 'Thomas Jefferson',
			inauguration: new Date('1801-03-04'),
			rating: 85,
			portrait:
				'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Official_Presidential_portrait_of_Thomas_Jefferson_%28by_Rembrandt_Peale%2C_1800%29.jpg/250px-Official_Presidential_portrait_of_Thomas_Jefferson_%28by_Rembrandt_Peale%2C_1800%29.jpg'
		},
		{
			name: 'Abraham Lincoln',
			inauguration: new Date('1861-03-04'),
			rating: 95,
			portrait:
				'https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/Abraham_Lincoln_1863_Portrait_%283x4_cropped%29.jpg/250px-Abraham_Lincoln_1863_Portrait_%283x4_cropped%29.jpg'
		},
		{
			name: 'Theodore Roosevelt',
			inauguration: new Date('1901-09-14'),
			rating: 88,
			portrait:
				'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Theodore_Roosevelt_by_the_Pach_Bros_%284x5_cropped%29.jpg/250px-Theodore_Roosevelt_by_the_Pach_Bros_%284x5_cropped%29.jpg'
		},
		{
			name: 'Franklin D. Roosevelt',
			inauguration: new Date('1933-03-04'),
			rating: 92,
			portrait:
				'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/FDR-1944-Campaign-Portrait_%283x4_retouched%2C_cropped%29.jpg/250px-FDR-1944-Campaign-Portrait_%283x4_retouched%2C_cropped%29.jpg'
		},
		{
			name: 'John F. Kennedy',
			inauguration: new Date('1961-01-20'),
			rating: 82,
			portrait:
				'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/John_F._Kennedy%2C_White_House_color_photo_portrait.jpg/250px-John_F._Kennedy%2C_White_House_color_photo_portrait.jpg'
		},
		{
			name: 'Ronald Reagan',
			inauguration: new Date('1981-01-20'),
			rating: 73,
			portrait:
				'https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/Official_Portrait_of_President_Reagan_1981.jpg/250px-Official_Portrait_of_President_Reagan_1981.jpg'
		},
		{
			name: 'Barack Obama',
			inauguration: new Date('2009-01-20'),
			rating: 76,
			portrait:
				'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/President_Barack_Obama.jpg/250px-President_Barack_Obama.jpg'
		}
	];
</script>

<Chart
	{data}
	x="inauguration"
	y="rating"
	yDomain={[60, 100]}
	padding={{ top: 20, bottom: 30, left: 36, right: 20 }}
	height={300}
>
	<Layer>
		<Axis placement="bottom" label="Inauguration" rule />
		<Axis placement="left" label="Historical rating" rule />
		<Image
			href="portrait"
			x="inauguration"
			y="rating"
			r={18}
			preserveAspectRatio="xMidYMid slice"
		/>
	</Layer>
</Chart>
