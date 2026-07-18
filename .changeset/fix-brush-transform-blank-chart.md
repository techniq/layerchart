---
'layerchart': patch
---

fix(Chart): Fix chart rendering blank when `brush` and `transform` are combined under Svelte's experimental async mode by lazy-loading interaction contexts via `$effect`/`{#if}` instead of nested `{#await import()}`.
