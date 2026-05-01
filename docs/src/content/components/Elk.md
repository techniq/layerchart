---
description: Layout component which arranges directed graphs using the Eclipse Layout Kernel (elkjs), supporting layered, tree, force, stress, radial, and other algorithms with extensive routing and spacing options.
category: layout
layers: [svg, canvas]
related: [Dagre]
---

## Usage

:example{name="basic"}

## Algorithms

### Layered

Sugiyama-style layered layout — the default and most flexible.

:example{name="layered"}

### Mr. Tree

Compact tree layout for strictly hierarchical graphs.

:example{name="mrtree"}

### Force

Force-directed layout for general undirected graphs.

:example{name="force"}

### Stress

Stress-majorization layout that preserves graph-theoretic distances.

:example{name="stress"}

### Radial

Radial tree layout that arranges nodes on concentric circles.

:example{name="radial"}

## Compound (hierarchical) graphs

Nodes with a `parent` reference are nested as children of that parent. Combine with `hierarchyHandling="include-children"` to route edges across hierarchy levels.

:example{name="cluster"}

:example{name="architecture"}

## Diagrams

:example{name="flowchart"}

:example{name="sequence-diagram"}

:example{name="oauth-flow"}

:example{name="state-machine"}

:example{name="state-composite"}

:example{name="erd"}

:example{name="tcp-state-diagram"}

## Playground

:example{name="playground"}
