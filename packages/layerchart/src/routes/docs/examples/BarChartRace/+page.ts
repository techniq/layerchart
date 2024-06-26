import { csvParse, autoType } from 'd3-dsv';
import { group, pairs, rollup } from 'd3-array';

import { sortFunc } from 'svelte-ux';

import pageSource from './+page.svelte?raw';

let numBars = 12;

function chartData(names: Set<string>, valueFunction: Function) {
  const data = Array.from(names, (name) => {
    return { name, value: valueFunction(name) };
  }).sort(sortFunc((d) => d.value, 'desc'));

  let chartNames = [];
  for (let i = 0; i < data.length; ++i) {
    data[i].rank = i;
    if (i < numBars) chartNames.push(data[i].name);
  }
  return { names: chartNames, data: data };
}

export async function load() {
  let data = await fetch('/data/examples/category-brands.csv').then(async (r) => {
    return csvParse(await r.text(), autoType);
  });

  const dataByDateAndName = Array.from(
    rollup(
      data,
      ([d]) => d.value,
      (d) => d.date,
      (d) => d.name
    )
  )
    .map(([date, data]) => [date, data])
    .sort(sortFunc((d) => d[0]));

  // all brand names in the dataset
  let names = new Set(data.map((d) => d.name));

  // create keyframes that interpolate between each date (year) in the dataset
  let keyframes = [];
  let dateLeft: Date;
  let dataByNameLeft: Map<string, number>;
  let dateRight: Date;
  let dataByNameRight: Map<string, number>;
  let k = 10;
  let allChartNames = [];

  for ([[dateLeft, dataByNameLeft], [dateRight, dataByNameRight]] of pairs(dataByDateAndName)) {
    for (let i = 0; i < k; ++i) {
      const t = i / k;
      let tmp = chartData(
        names,
        (name) => (dataByNameLeft.get(name) || 0) * (1 - t) + (dataByNameRight.get(name) || 0) * t
      );
      allChartNames = allChartNames.concat(tmp.names);
      keyframes.push({
        date: new Date(dateLeft * (1 - t) + dateRight * t),
        data: tmp.data,
      });
    }
  }

  let tmp = chartData(names, (name) => dataByNameRight.get(name) || 0);
  allChartNames = allChartNames.concat(tmp.names);
  keyframes.push({ date: new Date(dateRight), data: tmp.data });
  let namesInChart = Array.from(new Set(allChartNames));

  let finalKeyframes = [];
  for (let i = 0; i < keyframes.length; ++i) {
    let newKeyframe = { date: keyframes[i].date, data: [] };
    let keyframeMap = new Map(keyframes[i].data.map((d) => [d.name, d]));
    for (let j = 0; j < namesInChart.length; ++j) {
      newKeyframe.data.push(keyframeMap.get(namesInChart[j]));
    }
    finalKeyframes.push(newKeyframe);
  }

  keyframes = finalKeyframes;

  return {
    data,
    namesInChart,
    keyframes,
    meta: {
      pageSource,
      hideTableOfContents: true,
    },
  };
}
