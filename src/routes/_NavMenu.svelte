<script lang="ts">
	import { mdiHome } from '@mdi/js';
	import { NavItem } from 'svelte-ux';
</script>

<NavItem text="Home" icon={mdiHome} path="/" class="pl-6 py-2 mt-2" />

<div class="pt-4 pb-2 pl-4 text-xs text-gray-200 font-bold">Components</div>
<NavItem text="Chart" path="/components/chart" class="pl-6 py-2" />
<NavItem text="Text" path="/components/text" class="pl-6 py-2" />
