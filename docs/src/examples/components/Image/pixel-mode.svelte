<script lang="ts">
	import { Chart, Image, Layer } from 'layerchart';
</script>

<Chart padding={{ top: 10, bottom: 10, left: 10, right: 10 }} height={300}>
	<Layer>
		<Image
			href="https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/Meteosat-12-after-eqnx_04-b.jpg/250px-Meteosat-12-after-eqnx_04-b.jpg"
			x={150}
			y={140}
			width={120}
			height={120}
			r={60}
			preserveAspectRatio="xMidYMid slice"
		/>
	</Layer>
</Chart>
