import { timeYear, timeMonth, timeDay, type TimeInterval, timeTicks } from 'd3-time';

import {
  format,
  PeriodType,
  Duration,
  isLiteralObject,
  type FormatType,
  DateToken,
} from '@layerstack/utils';
import { isScaleBand, isScaleTime, type AnyScale } from './scales.svelte.js';

export function getDurationFormat(duration: Duration, multiline = false) {
  return function (date: Date, i: number) {
    if (+duration >= +new Duration({ duration: { years: 1 } })) {
      // Year
      return format(date, PeriodType.CalendarYear);
    } else if (+duration >= +new Duration({ duration: { days: 28 } })) {
      // Month
      const isFirst = i === 0 || +timeYear.floor(date) === +date;
      if (multiline) {
        return (
          format(date, PeriodType.Month, { variant: 'short' }) +
          (isFirst ? `\n${format(date, PeriodType.CalendarYear)}` : '')
        );
      } else {
        return (
          format(date, PeriodType.Month, { variant: 'short' }) +
          (isFirst ? ` '${format(date, PeriodType.CalendarYear, { variant: 'short' })}` : '')
        );
      }
    } else if (+duration >= +new Duration({ duration: { days: 1 } })) {
      // Day
      const isFirst = i === 0 || +timeMonth.floor(date) === +date;
      if (multiline) {
        return (
          format(date, PeriodType.Custom, { custom: DateToken.DayOfMonth_numeric }) +
          (isFirst ? `\n${format(date, PeriodType.Month, { variant: 'short' })}` : '')
        );
      } else {
        return format(date, PeriodType.Day, { variant: 'short' });
      }
    } else if (+duration >= +new Duration({ duration: { hours: 1 } })) {
      // Hours
      const isFirst = i === 0 || +timeDay.floor(date) === +date;
      if (multiline) {
        return (
          format(date, PeriodType.Custom, { custom: DateToken.Hour_numeric }) +
          (isFirst ? `\n${format(date, PeriodType.Day, { variant: 'short' })}` : '')
        );
      } else {
        return isFirst
          ? format(date, PeriodType.Day, { variant: 'short' })
          : format(date, PeriodType.Custom, { custom: DateToken.Hour_numeric });
      }
    } else if (+duration >= +new Duration({ duration: { minutes: 1 } })) {
      // Minutes
      const isFirst = i === 0 || +timeDay.floor(date) === +date;
      if (multiline) {
        return (
          format(date, PeriodType.TimeOnly, { variant: 'short' }) +
          (isFirst ? `\n${format(date, PeriodType.Day, { variant: 'short' })}` : '')
        );
      } else {
        return format(date, PeriodType.TimeOnly, { variant: 'short' });
      }
    } else if (+duration >= +new Duration({ duration: { seconds: 1 } })) {
      // Seconds
      return (
        format(date, PeriodType.TimeOnly) +
        (multiline && (i === 0 || +timeDay.floor(date) === +date)
          ? `\n${format(date, PeriodType.Day, { variant: 'short' })}`
          : '')
      );
    } else if (+duration >= +new Duration({ duration: { milliseconds: 1 } })) {
      // Milliseconds
      return (
        format(date, PeriodType.TimeOnly, { variant: 'long' }) +
        (multiline && (i === 0 || +timeDay.floor(date) === +date)
          ? `\n${format(date, PeriodType.Day, { variant: 'short' })}`
          : '')
      );
    } else {
      return date.toString();
    }
  };
}

export type TicksConfig =
  | number
  | any[]
  | ((scale: AnyScale) => any[] | undefined)
  | { interval: TimeInterval | null }
  | null;

export function resolveTickVals(scale: AnyScale, ticks?: TicksConfig, count?: number): any[] {
  // Explicit ticks
  if (Array.isArray(ticks)) return ticks;

  // Function
  if (typeof ticks === 'function') return ticks(scale) ?? [];

  // Interval
  if (isLiteralObject(ticks) && 'interval' in ticks) {
    if (ticks.interval === null || !('ticks' in scale) || typeof scale.ticks !== 'function') {
      return []; // Explicitly return empty array for null interval or invalid scale
    }
    return scale.ticks(ticks.interval as any);
  }

  // Band (use domain)
  if (isScaleBand(scale)) {
    return ticks && typeof ticks === 'number'
      ? scale.domain().filter((_, i) => i % ticks === 0)
      : scale.domain();
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
  multiline = false
) {
  // Explicit format
  if (formatType) {
    return (tick: any) => format(tick, formatType);
  }

  // Time scale
  if (isScaleTime(scale) && count) {
    // Compare first 2 ticks to determine duration between ticks for formatting
    const ticks = timeTicks(scale.domain()[0], scale.domain()[1], count);
    return getDurationFormat(new Duration({ start: ticks[0], end: ticks[1] }), multiline);
  }

  // Format from scale
  if (scale.tickFormat) {
    return scale.tickFormat(count);
  }

  return (tick: any) => `${tick}`;
}
