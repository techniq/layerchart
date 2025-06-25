import { csvParse, autoType } from 'd3-dsv';
import pageSource from './+page.svelte?raw';
import type { USEvents } from '$static/data/examples/date/us-events.js';

export async function load() {
  return {
    usEvents: await fetch('/data/examples/date/us-events.csv').then(async (r) => {
      return csvParse<USEvents>(
        await r.text(),
        // @ts-expect-error
        autoType
      ).map((d) => {
        return {
          startDate: new Date(d.startYear, 0, 1),
          endDate: new Date(d.endYear, 11, 31),
          event: d.event,
        };
      });
    }),
    meta: {
      pageSource,
      supportedContexts: ['svg', 'canvas'],
      related: ['components/BarChart', 'components/Points'],
    },
  };
}
