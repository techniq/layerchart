<script lang="ts">
	import { Chart, Layer, Circle, Arc } from 'layerchart';
</script>

<Chart height={200}>
	<Layer center type="canvas">
		<Circle fill="#F2D707" r={100} />
	</Layer>

	<Layer center type="svg">
		<Circle fill="black" r={15} cx={-30} cy={-30} />
		<Arc
			value={100}
			range={[-260, -100]}
			cornerRadius={25}
			innerRadius={50}
			outerRadius={65}
			fill="black"
		/>
	</Layer>

	<Layer center type="html">
		<Circle id="left-eye" fill="black" r={15} cx={30} cy={-30} />
	</Layer>
</Chart>

<style>
	:global(#left-eye) {
		transform-origin: center;
		animation: wink 3.5s infinite ease-in-out;
	}

	@keyframes wink {
		/* eye open */
		0%,
		68%,
		100% {
			transform: translate(-50%, -50%) scaleY(1);
		}

		/* eye closed (holds for 0.5s) */
		72%,
		92% {
			transform: translate(-50%, -50%) scaleY(0.1);
		}
	}
</style>
