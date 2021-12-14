<script lang="ts">
	export let id: string;

	export let from: string;
	export let to: string;

	export let vertical = false;
	export let x1 = '0%';
	export let y1 = '0%';
	export let x2 = vertical ? '0%' : '100%';
	export let y2 = vertical ? '100%' : '0%';

	export let rotate: number = undefined;
</script>

<defs>
	<linearGradient
		{id}
		{x1}
		{y1}
		{x2}
		{y2}
		gradientTransform={rotate ? `rotate(${rotate})` : ''}
		{...$$restProps}
	>
		<slot>
			<stop offset="0%" stop-color={from} />
			<stop offset="100%" stop-color={to} />
		</slot>
	</linearGradient>
</defs>
