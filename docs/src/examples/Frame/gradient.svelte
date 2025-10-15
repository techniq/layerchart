<script>
	import { Axis, Chart, Frame, Layer, LinearGradient } from 'layerchart';
</script>

<Chart
	xDomain={[0, 100]}
	yDomain={[0, 100]}
	padding={{ top: 20, bottom: 20, left: 20, right: 20 }}
	height={300}
>
	<Layer>
		<LinearGradient class="from-primary/10 to-secondary/10" vertical>
			{#snippet children({ gradient })}
				<Frame class="stroke-primary/10" fill={gradient} />
			{/snippet}
		</LinearGradient>
		<Axis placement="bottom" />
		<Axis placement="left" />
	</Layer>
</Chart>
