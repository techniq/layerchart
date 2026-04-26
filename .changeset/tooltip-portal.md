---
'layerchart': minor
---

feat(Tooltip): Portal tooltip to body by default to fix overflow clipping. Resolves #446

Tooltip.Root now portals to `document.body` (or `.PortalTarget`) by default using the `portal` action from `@layerstack/svelte-actions`. This prevents tooltips from being clipped by ancestor elements with `overflow: hidden`. The tooltip uses `position: fixed` with viewport-relative coordinates when portaled. Set `portal={false}` to restore the previous inline behavior. Both `contained="container"` and `contained="window"` modes continue to work correctly with portaling.
