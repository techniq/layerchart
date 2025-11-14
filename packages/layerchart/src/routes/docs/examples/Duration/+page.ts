import { csvParse, autoType } from 'd3-dsv';
import pageSource from './+page.svelte?raw';
import type { USEvents } from '$static/data/examples/date/us-events.js';
import type { CivilizationTimeline } from '$static/data/examples/date/civilization-timeline.js';
import { sortFunc } from '@layerstack/utils';

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
    civilizationEvents: await fetch('/data/examples/date/civilization-timeline.csv').then(
      async (r) => {
        return csvParse<CivilizationTimeline>(
          await r.text(),
          // @ts-expect-error
          autoType
        ).sort(sortFunc('start'));
      }
    ),
    meta: {
      pageSource,
      supportedContexts: ['svg', 'canvas'],
      related: ['components/BarChart', 'components/Points'],
    },
  };
}
