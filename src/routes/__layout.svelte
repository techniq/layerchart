<script lang="ts">
	import 'prism-themes/themes/prism-vsc-dark-plus.css';

	import { AppLayout } from 'svelte-ux';
	import NavMenu from './_NavMenu.svelte';
</script>

<AppLayout>
	<nav slot="nav" class="nav h-full">
		<NavMenu />
	</nav>

	<slot />
</AppLayout>

<style lang="postcss">
	@tailwind base;
	@tailwind components;
	@tailwind utilities;

	:global(body) {
		@apply bg-black/10;
	}
</style>
