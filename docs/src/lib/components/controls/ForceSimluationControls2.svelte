<script lang="ts">
	import { Field, Switch } from 'svelte-ux';

	interface Props {
		sticky?: boolean;
	}

	let { sticky = $bindable(true) }: Props = $props();
</script>

<div class="flex w-full justify-end screenshot-hidden">
	<Field dense class="inline-block mb-2" let:id>
		<label class="flex gap-2 items-center text-sm" for={id}>
			Sticky
			<Switch bind:checked={sticky} {id} />
		</label>
	</Field>
</div>
