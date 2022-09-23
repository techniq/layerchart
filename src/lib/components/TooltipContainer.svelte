<script lang="ts">
	export let header: any = undefined;
</script>

<div
	class="bg-gray-900/90 backdrop-filter backdrop-blur-[2px] text-white rounded elevation-1 px-2 py-1"
>
	{#if header || $$slots.header}
		<div class="text-center font-semibold pb-1 whitespace-nowrap">
			<slot name="header">
				{header}
			</slot>
		</div>
	{/if}

	<div class="grid grid-cols-[1fr,auto] gap-x-2 gap-y-1 items-center">
		<slot />
	</div>
</div>
