# LayerChart

![](https://img.shields.io/github/license/techniq/svelte-ux?style=flat)
[![](https://img.shields.io/npm/v/layerchart?style=flat)](https://www.npmjs.com/package/layerchart)
![npm](https://img.shields.io/npm/dw/layerchart?style=flat&color=orange)

![](https://img.shields.io/github/license/layerchart?style=flat)
[![](https://dcbadge.vercel.app/api/server/b94Kmm88?style=flat)](https://discord.gg/b94Kmm88)

A large collection of composable Svelte chart components to build a wide range of visualizations

- Cartesian (Bar, Area, Stack, Scatter)
- Radial (Pie, Arc, Sunburst)
- Hierarchy (Pack, Tree, Treemap, Sunburst)
- Graph (Sankey)
- Geo (Choropleth, Spike, Bubble, Point, Globe)

Interactions

- Tooltip, Highlights, Pan/Zoom

SVG

- Basic (Arc, Circle, Group, Line, Spline, Text)
- Gradients and Patterns
- ClipPath
- Multi-line text

Others

- Legends including ColorRamps

See also [Svelte UX](http://svelte-ux.techniq.dev) for a large collection of components, actions, stores, and utilities to build highly interactive applications.

## Publishing

- `npm run changeset` for each changelog worthy change
- `npm run version` to bump `package.json` version based on changesets, materialize changesets into CHANGELOG.md
- Commit as `Version bump to x.y.z` (TODO: automate)
- `npm run publish` to publish version to npm
- `git push --tags` to publish tags to Github
