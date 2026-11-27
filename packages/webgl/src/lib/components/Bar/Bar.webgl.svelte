<script lang="ts" module>
  import type { BarProps } from './Bar.shared.svelte.js';
</script>

<script lang="ts">
  import BarsBase from '../Bars/Bars.base.svelte';

  let { data, ...props }: BarProps = $props();
</script>

<BarsBase {...props} data={[data]} />
