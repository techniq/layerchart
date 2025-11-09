<script lang="ts">
	import { Field, Switch } from 'svelte-ux';

	// <StickyControl bind:sticky />

	interface Props {
		sticky?: boolean;
	}

	let { sticky = $bindable(true) }: Props = $props();
</script>

<div class="flex w-full justify-end lc-example-controls">
	<Field dense class="inline-block mb-2" let:id>
		<label class="flex gap-2 items-center text-sm" for={id}>
			Sticky
			<Switch bind:checked={sticky} {id} />
		</label>
	</Field>
</div>
