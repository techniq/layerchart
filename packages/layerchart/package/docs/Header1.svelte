<script>
	import { SectionDivider } from 'svelte-ux';
</script>

<!--
  TODO:
    - [ ] Set id based on slot value
      - Needed for #examples, #api, etc
      - Maybe possible to set/get props from markdown/mdsvex
        - Example: `#API { id: 'api' }
-->
<SectionDivider {...$$restProps}>
	<slot />
</SectionDivider>
