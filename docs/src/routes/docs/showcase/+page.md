<script lang="ts">
  import Showcase from './Showcase.svelte';
  import { getDependents } from './dependency.remote';

  const { featuredSites, supporterSites, popularSites, otherSites } = await getDependents();
</script>

# Showcase

## Featured

<Showcase sites={featuredSites} />

## [Supporters](https://github.com/techniq/layerchart?tab=readme-ov-file#sponsors)

<Showcase sites={supporterSites} />

## Popular

<Showcase sites={popularSites} />

## Other

<Showcase sites={otherSites} />

## [More](https://github.com/techniq/layerchart/network/dependents)
