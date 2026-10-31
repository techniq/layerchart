# @layerchart/3d

True 3D charts for [LayerChart](https://layerchart.com), drawn with [three.js](https://threejs.org) through [Threlte](https://threlte.xyz).

```sh
npm i @layerchart/3d
```

```svelte
<script>
  import { Axis, Chart, Grid, Points, Scene } from '@layerchart/3d';
</script>

<Chart {data} x="x" y="y" z="z">
  <Scene>
    <Grid />
    <Axis placement="bottom" />
    <Axis placement="left" />
    <Axis placement="back" />
    <Points />
  </Scene>
</Chart>
```

See the [3D guide](https://layerchart.com/docs/guides/3d).
