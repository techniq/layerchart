import {
  timeYear,
  timeMonth,
  timeWeek,
  timeDay,
  timeHour,
  timeMinute,
  timeSecond,
  timeMillisecond,
  type TimeInterval,
} from 'd3-time';

import {
  format,
  PeriodType,
  getDuration,
  fail,
  isLiteralObject,
  type FormatType,
} from '@layerstack/utils';
import { isScaleBand, isScaleTime, type AnyScale } from './scales.svelte.js';

type Duration = ReturnType<typeof getDuration>;

// TODO: Use PeriodType along with Duration to format (and possibly select intervals)

const majorTicks = [
  {
    predicate: (duration: Duration) => duration == null, // Unknown
    interval: timeYear.every(1), // Better than rendering a lot of items
    format: (date: Date) => date.toString(),
  },
  {
    predicate: (duration: Duration) => duration!.years > 1,
    interval: timeYear.every(1),
    format: (date: Date) => format(date, PeriodType.CalendarYear),
  },
  {
    predicate: (duration: Duration) => duration!.years,
    interval: timeMonth.every(1),
    format: (date: Date) => format(date, PeriodType.Month, { variant: 'short' }),
  },
  {
    predicate: (duration: Duration) => duration!.days > 30,
    interval: timeMonth.every(1),
    format: (date: Date) => format(date, PeriodType.Month, { variant: 'short' }),
  },
  {
    predicate: (duration: Duration) => duration!.days,
    interval: timeDay.every(1),
    format: (date: Date) => format(date, PeriodType.Day, { variant: 'short' }),
  },
  {
    predicate: (duration: Duration) => duration!.hours,
    interval: timeHour.every(1),
    format: (date: Date) => format(date, PeriodType.TimeOnly, { variant: 'short' }),
  },
  {
    predicate: (duration: Duration) => duration!.minutes > 10,
    interval: timeMinute.every(10),
    format: (date: Date) => format(date, PeriodType.TimeOnly, { variant: 'short' }),
  },
  {
    predicate: (duration: Duration) => duration!.minutes,
    interval: timeMinute.every(1),
    format: (date: Date) => format(date, PeriodType.TimeOnly, { variant: 'short' }),
  },
  {
    predicate: (duration: Duration) => duration!.seconds > 10,
    interval: timeSecond.every(10),
    format: (date: Date) => format(date, PeriodType.TimeOnly),
  },
  {
    predicate: (duration: Duration) => duration!.seconds,
    interval: timeSecond.every(1),
    format: (date: Date) => format(date, PeriodType.TimeOnly),
  },
  {
    predicate: (duration: Duration) => true, // 0 or more milliseconds
    interval: timeMillisecond.every(100),
    format: (date: Date) => format(date, PeriodType.TimeOnly, { variant: 'long' }),
  },
];

const minorTicks = [
  {
    predicate: (duration: Duration) => duration == null, // Unknown
    interval: timeYear.every(1), // Better than rendering a lot of items
    format: (date: Date) => date.toString(),
  },
  {
    predicate: (duration: Duration) => duration!.years,
    interval: timeMonth.every(1),
    format: (date: Date) => format(date, PeriodType.Month, { variant: 'short' }),
  },
  {
    predicate: (duration: Duration) => duration!.days > 90,
    interval: timeMonth.every(1),
    format: (date: Date) => format(date, PeriodType.Month, { variant: 'short' }),
  },
  {
    predicate: (duration: Duration) => duration!.days > 30,
    interval: timeWeek.every(1),
    format: (date: Date) => format(date, PeriodType.WeekSun, { variant: 'short' }),
  },
  {
    predicate: (duration: Duration) => duration!.days > 7,
    interval: timeDay.every(1),
    format: (date: Date) => format(date, PeriodType.Day, { variant: 'short' }),
  },
  {
    predicate: (duration: Duration) => duration!.days > 3,
    interval: timeHour.every(8),
    format: (date: Date) => format(date, PeriodType.TimeOnly, { variant: 'short' }),
  },
  {
    predicate: (duration: Duration) => duration!.days,
    interval: timeHour.every(1),
    format: (date: Date) => format(date, PeriodType.TimeOnly, { variant: 'short' }),
  },
  {
    predicate: (duration: Duration) => duration!.hours,
    interval: timeMinute.every(15),
    format: (date: Date) => format(date, PeriodType.TimeOnly, { variant: 'short' }),
  },
  {
    predicate: (duration: Duration) => duration!.minutes > 10,
    interval: timeMinute.every(10),
    format: (date: Date) => format(date, PeriodType.TimeOnly, { variant: 'short' }),
  },
  {
    predicate: (duration: Duration) => duration!.minutes > 2,
    interval: timeMinute.every(1),
    format: (date: Date) => format(date, PeriodType.TimeOnly, { variant: 'short' }),
  },
  {
    predicate: (duration: Duration) => duration!.minutes,
    interval: timeSecond.every(10),
    format: (date: Date) => format(date, PeriodType.TimeOnly),
  },
  {
    predicate: (duration: Duration) => duration!.seconds,
    interval: timeSecond.every(1),
    format: (date: Date) => format(date, PeriodType.TimeOnly),
  },
  {
    predicate: (duration: Duration) => true, // 0 or more milliseconds
    interval: timeMillisecond.every(10),
    format: (date: Date) => format(date, PeriodType.TimeOnly, { variant: 'long' }),
  },
];

export function getMajorTicks(domain: Date[]) {
  const duration = getDuration(domain[0], domain[1]);

  for (var t of majorTicks) {
    if (t.predicate(duration)) {
      return t;
    }
  }

  fail(`Unable to locate major ticks for duration: ${duration}`);
}

export function getMinorTicks(domain: Date[]) {
  const duration = getDuration(domain[0], domain[1]);

  for (var t of minorTicks) {
    if (t.predicate(duration)) {
      return t;
    }
  }

  fail(`Unable to locate minor ticks for duration: ${duration}`);
}

export type TicksConfig =
  | number
  | any[]
  | ((scale: AnyScale) => any[] | undefined)
  | { interval: TimeInterval | null }
  | null;

export function resolveTickVals(scale: AnyScale, ticks?: TicksConfig, count?: number): any[] {
  if (Array.isArray(ticks)) return ticks;

  if (typeof ticks === 'function') return ticks(scale) ?? [];

  if (isLiteralObject(ticks) && 'interval' in ticks) {
    if (ticks.interval === null || !('ticks' in scale) || typeof scale.ticks !== 'function') {
      return []; // Explicitly return empty array for null interval or invalid scale
    }
    return scale.ticks(ticks.interval as any);
  }

  if (isScaleBand(scale)) {
    return ticks && typeof ticks === 'number'
      ? scale.domain().filter((_, i) => i % ticks === 0)
      : scale.domain();
  }

  if (isScaleTime(scale)) {
    const ticks = getMajorTicks(scale.domain())!;
    // const ticks = getMinorTicks(scale.domain());
    return scale.ticks(ticks.interval!);
  }

  // Ticks from scale
  if (scale.ticks && typeof scale.ticks === 'function') {
    return scale.ticks(count);
  }

  return [];
}

export function resolveTickFormat(
  scale: AnyScale,
  formatType: FormatType | undefined,
  count: number | undefined
) {
  if (formatType) {
    return (tick: any) => format(tick, formatType);
  }

  if (isScaleTime(scale)) {
    const ticks = getMajorTicks(scale.domain());
    // const ticks = getMinorTicks(scale.domain());
    return ticks.format;
  }

  if (scale.tickFormat) {
    return scale.tickFormat(count);
  }

  return (tick: any) => `${tick}`;
}
