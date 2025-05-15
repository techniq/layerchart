<script lang="ts">
  import { SectionDivider } from 'svelte-ux';

  let { children, ...restProps } = $props();
</script>

<!--
  TODO:
    - [ ] Set id based on slot value
      - Needed for #examples, #api, etc
      - Maybe possible to set/get props from markdown/mdsvex
        - Example: `#API { id: 'api' }
-->
<SectionDivider {...restProps}>
  {@render children()}
</SectionDivider>
