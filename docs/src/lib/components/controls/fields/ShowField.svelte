<script lang="ts">
	import { Field, Switch, type LabelPlacement } from 'svelte-ux';

	let {
		show = $bindable(true),
		label = 'Show',
		labelPlacement = 'left' as LabelPlacement,
		class: className = 'absolute top-2 right-2 z-1'
	} = $props();
</script>

<div class="grid grid-cols-[auto_1fr] gap-2 mb-3 screenshot-hidden">
	<Field {label} {labelPlacement} let:id class={className}>
		<Switch bind:checked={show} size="md" />
	</Field>
</div>
