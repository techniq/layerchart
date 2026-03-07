<script lang="ts">
  import Showcase from './Showcase.svelte';
  import { getDependents } from './dependency.remote';

  const { featuredSites, supporterSites, popularSites, otherSites } = await getDependents();
</script>

# Showcase

## Featured

<Showcase sites={featuredSites} />

## Supporters

<Showcase sites={supporterSites} />

[Become a sponsor](https://github.com/techniq/layerchart?tab=readme-ov-file#sponsors)

## Popular

<Showcase sites={popularSites} />

## Other

<Showcase sites={otherSites} />

[View all dependents on GitHub](https://github.com/techniq/layerchart/network/dependents)
