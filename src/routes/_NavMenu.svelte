<script lang="ts">
	import { mdiHome } from '@mdi/js';
	import { NavItem } from 'svelte-ux';
</script>

<NavItem text="Home" icon={mdiHome} path="/" class="pl-6 py-2 mt-2" />

<div class="pt-4 pb-2 pl-4 text-xs text-gray-200 font-bold">Components</div>
<NavItem text="Text" path="/components/Text" class="pl-6 py-2" />

<div class="pt-4 pb-2 pl-4 text-xs text-gray-200 font-bold">Utils</div>
<NavItem text="pivot" path="/utils/pivot" class="pl-6 py-2" />

<div class="pt-4 pb-2 pl-4 text-xs text-gray-200 font-bold">Chart Examples</div>
<NavItem text="Area" path="/examples/Area" class="pl-6 py-2" />
<NavItem text="AreaStack" path="/examples/AreaStack" class="pl-6 py-2" />
<NavItem text="Bar" path="/examples/Bar" class="pl-6 py-2" />
<NavItem text="ClevelandDotPlot" path="/examples/ClevelandDotPlot" class="pl-6 py-2" />
<NavItem text="Scatter" path="/examples/Scatter" class="pl-6 py-2" />
<NavItem text="Threshold" path="/examples/Threshold" class="pl-6 py-2" />
