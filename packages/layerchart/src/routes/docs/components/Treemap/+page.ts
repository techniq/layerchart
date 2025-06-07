import api from '$lib/components/Treemap.svelte?raw&sveld';
import source from '$lib/components/Treemap.svelte?raw';
import pageSource from './+page.svelte?raw';

export async function load() {
  return {
    flare: await fetch('/data/examples/hierarchy/flare.json').then((r) => r.json()),
    population: {
      name: 'World',
      children: [
        {
          name: 'Europe',
          children: [
            { name: 'Western Europe', value: 200 }, // ~200M based on UN data
            { name: 'Southern Europe', value: 151 }, // ~151M based on UN data
            { name: 'Eastern Europe', value: 284 }, // ~284M based on UN data
            { name: 'Northern Europe', value: 109 }, // ~109M based on UN data
          ],
        },
        {
          name: 'Asia',
          children: [
            { name: 'East Asia', value: 1652 }, // 1,652M based on UN data
            { name: 'South Asia', value: 2085 }, // 2,085M based on UN data
            { name: 'Southeast Asia', value: 700 }, // 700M based on UN data
            { name: 'Western Asia', value: 314 }, // 314M based on UN data
            { name: 'Central Asia', value: 84 }, // 84M based on UN data
          ],
        },
        {
          name: 'North America',
          children: [
            { name: 'Northern America', value: 388 }, // ~388M based on UN data
            { name: 'Central America', value: 184 }, // ~184M (estimated from total minus Northern America)
          ],
        },
        {
          name: 'South America',
          children: [{ name: 'South America', value: 434 }], // ~434M based on UN data
        },
        {
          name: 'Africa',
          children: [
            { name: 'Western Africa', value: 467 }, // 467M based on UN data
            { name: 'Southern Africa', value: 74 }, // 74M based on UN data
            { name: 'Northern Africa', value: 276 }, // 276M based on UN data
            { name: 'Eastern Africa', value: 513 }, // 513M based on UN data
            { name: 'Middle Africa', value: 220 }, // 220M based on UN data
          ],
        },
        {
          name: 'Oceania',
          children: [{ name: 'Oceania', value: 47 }], // 47M based on UN data
        },
      ],
    },

    meta: {
      api,
      source,
      pageSource,
      supportedContexts: ['svg', 'canvas'],
      related: ['examples/Treemap'],
    },
  };
}
