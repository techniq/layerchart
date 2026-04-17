<script lang="ts">
	import { Button, Toggle, ButtonGroup, Icon, MenuItem, Menu } from 'svelte-ux';
	import { openInSvelteREPL } from '$lib/utils/svelte-repl';
	import { openInStackBlitz } from '$lib/utils/stackblitz.svelte';

	import ChevronDownIcon from '~icons/lucide/chevron-down';
	import LucideFilePen from '~icons/lucide/file-pen';
	import StackBlitzIcon from '~icons/simple-icons/stackblitz';
	import SvelteIcon from '~icons/simple-icons/svelte';

	let { component, source, name } = $props();

	let isOpen = $state(false);
</script>

<ButtonGroup class="text-surface-content/70 py-1">
	<Toggle bind:on={isOpen} let:on={open} let:toggle let:toggleOff>
		<Button icon={LucideFilePen} on:click={toggle} class="py-1">
			Edit
			<span style="transition: transform 300ms ease; transform: rotate({open ? -180 : 0}deg);">
				<ChevronDownIcon />
			</span>
			<Menu {open} on:close={toggleOff} placement="bottom-start" class="z-25">
				<MenuItem
					class="text-surface-content/70 hover:text-surface-content"
					onclick={() => {
						toggleOff();
						openInSvelteREPL(source);
					}}
				>
					<Icon data={SvelteIcon} />
					Svelte REPL
				</MenuItem>
				<MenuItem
					class="text-surface-content/70 hover:text-surface-content"
					onclick={() => {
						toggleOff();
						openInStackBlitz(component, name);
					}}
				>
					<Icon data={StackBlitzIcon} />
					StackBlitz
				</MenuItem>
			</Menu>
		</Button>
	</Toggle>
</ButtonGroup>
