# layerchart

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

## Publishing

- `npm run changeset` for each changelog worthy change
- `npm run version` to bump `package.json` version based on changesets, materialize changesets into CHANGELOG.md
- Commit as `Version bump to x.y.z` (TODO: automate)
- `npm run publish` to publish version to npm
- `git push --tags` to publish tags to Github
