---
'layerchart': patch
---

fix: improve compatibility with UnoCSS Svelte scoped preprocessing

- Remove TypeScript-only `as` assertions from exported Svelte markup in core mark components so preprocessors that parse markup expressions as plain JavaScript can consume packaged components without failing
