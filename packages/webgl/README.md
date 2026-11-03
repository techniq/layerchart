# @layerchart/webgl

True 3D charts for [LayerChart](https://layerchart.com), drawn with [three.js](https://threejs.org) through [Threlte](https://threlte.xyz).

```sh
npm i @layerchart/webgl
```

```svelte
<script>
  import { Axis, Chart, Grid, Points, WebGL } from '@layerchart/webgl';
</script>

<Chart {data} x="x" y="y" z="z">
  <WebGL>
    <Grid />
    <Axis placement="bottom" />
    <Axis placement="left" />
    <Axis placement="back" />
    <Points />
  </WebGL>
</Chart>
```

See the [WebGL guide](https://layerchart.com/docs/guides/webgl).
