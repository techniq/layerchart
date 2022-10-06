<script lang="ts">
	import clsx from 'clsx';

	export let label: any;
	export let value: any = undefined; // Can be pass as slot

	export let valueAlign: 'left' | 'right' | 'center' = 'left';
</script>

<div class="text-xs text-white/75 text-right whitespace-nowrap">
	<slot name="label">{label}:</slot>
</div>

<div
	class={clsx('text-sm tabular-nums', {
		'text-right': valueAlign === 'right',
		'text-center': valueAlign === 'center'
	})}
>
	<slot>{value}</slot>
</div>
