## Source (packed)

### Structure

```js
[fieldCount, ...fields, ...data];
```

### Data

```js
[7,"epoch","idl","recv","send","writ","used","free",26107560,99.46,0,0,0.63,614.52,3767,....]
```

## Array per dimension

### uPlot - https://github.com/leeoniya/uPlot/blob/master/bench/uPlot.html

```js
[
  [Number, ...], // date
  [Number, ...], // cpu
  [Number, ...], // ram
  [Number, ...], // tcp
]
```

or

```js
{
  date: [Number, ...],
  cpu: [Number, ...],
  ram: [Number, ...],
  tcp: [Number, ...],
}
```

Notes:

- Need to know the structure of the data (just array of arrays)
  - Could be object container
- No duplication of property names
- Empty data would need `null` / `undefined` "placeholders

## Single array (dimension by position/offset)

### ECharts - https://github.com/leeoniya/uPlot/blob/master/bench/ECharts5.html

```js
[Number, Number, Number, Number, ...] // date, cpu, ram, tcpout, ...
```

Notes:

- Must know structure of data as separate metadata

## Array / points per series

### Charts.js - https://github.com/leeoniya/uPlot/blob/master/bench/Chart.js4.html

## amCharts5 - https://github.com/leeoniya/uPlot/blob/master/bench/amCharts5.html

```js
{
  cpu: [{ x: Date: y: Number }, ...],
  ram: [{ x: Date: y: Number }, ...],
  tcp: [{ x: Date: y: Number }, ...],
}
```

Notes:

- Human readable
- Easy to consume
- Larger due to duplicated properties, but shorter

### Highchart - https://github.com/leeoniya/uPlot/blob/master/bench/Highcharts.html

### Plotly - https://github.com/leeoniya/uPlot/blob/master/bench/Plotly.js.html

```js
{
  cpu: [[Date,Number], ...],
  ram: [[Date,Number], ...],
  tcp: [[Date,Number], ...],
}
```

## Expanded

### LayerChart (another option, along with many above)

```js
[
  { date: Date, cpu: Number: ram: Number, tcp: Number },
  ...
]
```

Notes:

- Human readable
- Larger due to duplicated properties
