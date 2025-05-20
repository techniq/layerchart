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
  Duration,
  fail,
  isLiteralObject,
  type FormatType,
  DateToken,
} from '@layerstack/utils';
import { isScaleBand, isScaleTime, type AnyScale } from './scales.svelte.js';

export function getMajorTicks(domain: Date[], multiline = false) {
  const duration = new Duration({ start: domain[0], end: domain[1] });

  const confs = [
    {
      predicate: (duration: Duration) => duration == null, // Unknown
      interval: timeYear.every(1), // Better than rendering a lot of items
      format: (date: Date, i: number) => date.toString(),
    },
    // > 1 year
    {
      predicate: (duration: Duration) => +duration > +new Duration({ duration: { years: 1 } }),
      interval: timeYear.every(1),
      format: (date: Date, i: number) => format(date, PeriodType.CalendarYear),
    },
    // 91 days - 1 year
    {
      predicate: (duration: Duration) => +duration >= +new Duration({ duration: { days: 91 } }),
      interval: timeMonth.every(1),
      format: (date: Date, i: number) => {
        return (
          format(date, PeriodType.Month, { variant: 'short' }) +
          (multiline && (i === 0 || +timeYear.floor(date) === +date)
            ? `\n${format(date, PeriodType.CalendarYear)}`
            : '')
        );
      },
    },
    // 31 - 90 days
    {
      predicate: (duration: Duration) => +duration >= +new Duration({ duration: { days: 31 } }),
      interval: timeDay.every(7),
      format: (date: Date, i: number) => {
        if (multiline) {
          return (
            format(date, PeriodType.Custom, { custom: DateToken.DayOfMonth_numeric }) +
            (i === 0 || +timeMonth.floor(date) === +date
              ? `\n${format(date, PeriodType.Month, { variant: 'short' })}`
              : '')
          );
        } else {
          return format(date, PeriodType.Day, { variant: 'short' });
        }
      },
    },
    // 3 - 30 days
    {
      predicate: (duration: Duration) => +duration >= +new Duration({ duration: { days: 3 } }),
      interval: timeDay.every(1),
      format: (date: Date, i: number) => {
        if (multiline) {
          return (
            format(date, PeriodType.Custom, { custom: DateToken.DayOfMonth_numeric }) +
            (i === 0 || +timeMonth.floor(date) === +date
              ? `\n${format(date, PeriodType.Month, { variant: 'short' })}`
              : '')
          );
        } else {
          return format(date, PeriodType.Day, { variant: 'short' });
        }
      },
    },
    // 1 hour - 3 days
    {
      predicate: (duration: Duration) => +duration > +new Duration({ duration: { hours: 1 } }),
      interval: timeHour.every(1),
      format: (date: Date, i: number) => {
        return (
          format(date, PeriodType.Custom, { custom: DateToken.Hour_numeric }) +
          (multiline && (i === 0 || +timeDay.floor(date) === +date)
            ? `\n${format(date, PeriodType.Day, { variant: 'short' })}`
            : '')
        );
      },
    },
    // 10 minutes - 1 hour
    {
      predicate: (duration: Duration) => +duration >= +new Duration({ duration: { minutes: 10 } }),
      interval: timeMinute.every(10),
      format: (date: Date, i: number) =>
        format(date, PeriodType.TimeOnly, { variant: 'short' }) +
        (multiline && (i === 0 || +timeDay.floor(date) === +date)
          ? `\n${format(date, PeriodType.Day, { variant: 'short' })}`
          : ''),
    },
    // 1 minute - 10 minutes
    {
      predicate: (duration: Duration) => +duration >= +new Duration({ duration: { minutes: 1 } }),
      interval: timeMinute.every(1),
      format: (date: Date, i: number) =>
        format(date, PeriodType.TimeOnly, { variant: 'short' }) +
        (multiline && (i === 0 || +timeDay.floor(date) === +date)
          ? `\n${format(date, PeriodType.Day, { variant: 'short' })}`
          : ''),
    },
    // 10 seconds - 1 minute
    {
      predicate: (duration: Duration) => +duration >= +new Duration({ duration: { seconds: 10 } }),
      interval: timeSecond.every(10),
      format: (date: Date, i: number) =>
        format(date, PeriodType.TimeOnly) +
        (multiline && (i === 0 || +timeDay.floor(date) === +date)
          ? `\n${format(date, PeriodType.Day, { variant: 'short' })}`
          : ''),
    },
    // 1 second - 10 seconds
    {
      predicate: (duration: Duration) => +duration >= +new Duration({ duration: { seconds: 1 } }),
      interval: timeSecond.every(1),
      format: (date: Date, i: number) =>
        format(date, PeriodType.TimeOnly) +
        (multiline && (i === 0 || +timeDay.floor(date) === +date)
          ? `\n${format(date, PeriodType.Day, { variant: 'short' })}`
          : ''),
    },
    // <1 second (milliseconds)
    {
      predicate: (duration: Duration) => true, // 0 or more milliseconds
      interval: timeMillisecond.every(100),
      format: (date: Date, i: number) =>
        format(date, PeriodType.TimeOnly, { variant: 'long' }) +
        (multiline && (i === 0 || +timeDay.floor(date) === +date)
          ? `\n${format(date, PeriodType.Day, { variant: 'short' })}`
          : ''),
    },
  ];

  for (var c of confs) {
    if (c.predicate(duration)) {
      return c;
    }
  }

  fail(`Unable to locate major ticks for duration: ${duration}`);
}

export function getMinorTicks(domain: Date[]) {
  const duration = new Duration({ start: domain[0], end: domain[1] });

  // TODO: Update to align with getMajorTicks changes
  const confs = [
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

  for (var c of confs) {
    if (c.predicate(duration)) {
      return c;
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

export function resolveTickVals(
  scale: AnyScale,
  ticks?: TicksConfig,
  count?: number,
  tickMultiline = false
): any[] {
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
    const ticks = getMajorTicks(scale.domain(), tickMultiline)!;
    return scale.ticks(ticks.interval!);
  }

  // Ticks from scale
  if (scale.ticks && typeof scale.ticks === 'function') {
    return scale.ticks(count ?? (typeof ticks === 'number' ? ticks : undefined));
  }

  return [];
}

export function resolveTickFormat(
  scale: AnyScale,
  formatType: FormatType | undefined,
  count: number | undefined,
  tickMultiline = false
) {
  if (formatType) {
    return (tick: any) => format(tick, formatType);
  }

  if (isScaleTime(scale)) {
    const ticks = getMajorTicks(scale.domain(), tickMultiline);
    // const ticks = getMinorTicks(scale.domain());
    return ticks.format;
  }

  if (scale.tickFormat) {
    return scale.tickFormat(count);
  }

  return (tick: any) => `${tick}`;
}
