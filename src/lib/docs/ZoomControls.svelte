<script lang="ts">
	import { Button, Tooltip } from 'svelte-ux';

	import {
		mdiArrowULeftTop,
		mdiMagnifyPlusOutline,
		mdiMagnifyMinusOutline,
		mdiImageFilterCenterFocus
	} from '@mdi/js';
	import type Zoom from '$lib/components/Zoom.svelte';

	export let zoom: Zoom;
</script>

<div class="bg-black/5 rounded-full m-1 backdrop-blur">
	<Tooltip title="Zoom in">
		<Button
			icon={mdiMagnifyPlusOutline}
			on:click={() => zoom.increase()}
			class="text-black/50 p-2"
		/>
	</Tooltip>
	<Tooltip title="Zoom out">
		<Button
			icon={mdiMagnifyMinusOutline}
			on:click={() => zoom.decrease()}
			class="text-black/50 p-2"
		/>
	</Tooltip>
	<Tooltip title="Center">
		<Button
			icon={mdiImageFilterCenterFocus}
			on:click={() => zoom.translateCenter()}
			class="text-black/50 p-2"
		/>
	</Tooltip>
	<Tooltip title="Reset">
		<Button icon={mdiArrowULeftTop} on:click={() => zoom.reset()} class="text-black/50 p-2" />
	</Tooltip>
</div>
