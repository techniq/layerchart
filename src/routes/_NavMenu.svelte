<script lang="ts">
	import { mdiHome } from '@mdi/js';
	import { NavItem } from 'svelte-ux';
</script>

<NavItem text="Home" icon={mdiHome} path="/" class="pl-6 py-2 mt-2" />

<div class="pt-4 pb-2 pl-4 text-xs text-gray-200 font-bold">Components</div>
<NavItem text="Text" path="/components/Text" class="pl-6 py-2" />

<div class="pt-4 pb-2 pl-4 text-xs text-gray-200 font-bold">Chart Examples</div>
<NavItem text="Area Chart" path="/examples/AreaChart" class="pl-6 py-2" />
<NavItem text="Bar Chart" path="/examples/BarChart" class="pl-6 py-2" />
<NavItem text="ClevelandDotPlot" path="/examples/ClevelandDotPlot" class="pl-6 py-2" />
