<script lang="ts">
	import { cls } from 'svelte-ux/utils/styles';
	import { format as formatUtil } from 'svelte-ux/utils/format';
	import type { FormatType } from 'svelte-ux/utils/format';

	export let label: any;
	export let value: any = undefined; // Can be pass as slot
	export let format: FormatType = undefined;

	export let valueAlign: 'left' | 'right' | 'center' = 'left';
</script>

<div class="text-xs text-white/75 text-right whitespace-nowrap">
	<slot name="label">{label}:</slot>
</div>

<div
	class={cls(
		'text-sm tabular-nums',
		{
			'text-right': valueAlign === 'right',
			'text-center': valueAlign === 'center'
		},
		$$props.class
	)}
>
	<slot>{format ? formatUtil(value, format) : value}</slot>
</div>
