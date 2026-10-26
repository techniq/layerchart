import { describe, it, expect } from 'vitest';
import { render } from 'svelte/server';

import AttributesChart from './__fixtures__/AttributesChart.svelte';

const data = [
  { x: 1, y: 10 },
  { x: 2, y: 30 },
];

function renderChart(layer: 'svg' | 'html') {
  return render(AttributesChart, {
    props: {
      layer,
      ssr: true,
      width: 400,
      height: 200,
      data,
      x: 'x',
      y: 'y',
      yDomain: [0, 40],
      padding: { left: 20 },
      id: 'revenue',
      'data-testid': 'chart',
    },
  }).body;
}

/** The attribute names of each element `tag` matches, e.g. `/<div\s([^>]*)>/g` */
function attributeNames(html: string, tag: RegExp) {
  return [...html.matchAll(tag)].map(([, attrs]) =>
    [...attrs.matchAll(/([^\s=]+)(?:="[^"]*")?/g)].map(([, name]) => name)
  );
}

describe('rendered attributes', () => {
  it('the chart root carries its HTML attributes, not its options', () => {
    const [root] = attributeNames(renderChart('svg'), /<div\s([^>]*)>/g);

    expect(root).toEqual(expect.arrayContaining(['id', 'data-testid']));
    expect(root).not.toEqual(
      expect.arrayContaining([expect.stringMatching(/^(data|x|y|ydomain|padding)$/)])
    );
  });

  it('text carries no layout options', () => {
    for (const text of attributeNames(renderChart('svg'), /<text\s([^>]*)>/g)) {
      expect(text).toContain('text-anchor');
      for (const name of ['value', 'textAnchor', 'verticalAnchor', 'capHeight', 'lineHeight']) {
        expect(text).not.toContain(name);
      }
    }
  });

  it.each(['svg', 'html'] as const)("data-mode marks don't write their data (%s)", (layer) => {
    const html = renderChart(layer);

    expect(html).not.toContain('[object Object]');
    // `x` / `y` are attributes of `<svg>`, `<text>`, `<tspan>` and `<rect>` only
    expect(html).not.toMatch(/<(?!svg|text|tspan|rect)[a-z]+ [^>]*\s(data|x|y)="/);
  });
});
