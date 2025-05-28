import { timeYear, timeMonth, timeDay, type TimeInterval, timeTicks } from 'd3-time';

import { format, Duration, isLiteralObject, type FormatType, DateToken } from '@layerstack/utils';
import { isScaleBand, isScaleTime, type AnyScale } from './scales.svelte.js';

export function getDurationFormat(duration: Duration, multiline = false) {
  return function (date: Date, i: number) {
    if (+duration >= +new Duration({ duration: { years: 1 } })) {
      // Year
      return format(date, 'year');
    } else if (+duration >= +new Duration({ duration: { days: 28 } })) {
      // Month
      const isFirst = i === 0 || +timeYear.floor(date) === +date;
      if (multiline) {
        return (
          format(date, 'month', { variant: 'short' }) + (isFirst ? `\n${format(date, 'year')}` : '')
        );
      } else {
        return (
          format(date, 'month', { variant: 'short' }) +
          (isFirst ? ` '${format(date, 'year', { variant: 'short' })}` : '')
        );
      }
    } else if (+duration >= +new Duration({ duration: { days: 1 } })) {
      // Day
      const isFirst = i === 0 || date.getDate() <= duration.days;
      if (multiline) {
        return (
          format(date, 'custom', { custom: DateToken.DayOfMonth_numeric }) +
          (isFirst ? `\n${format(date, 'month', { variant: 'short' })}` : '')
        );
      } else {
        return format(date, 'day', { variant: 'short' });
      }
    } else if (+duration >= +new Duration({ duration: { hours: 1 } })) {
      // Hours
      const isFirst = i === 0 || +timeDay.floor(date) === +date;
      if (multiline) {
        return (
          format(date, 'custom', { custom: DateToken.Hour_numeric }) +
          (isFirst ? `\n${format(date, 'day', { variant: 'short' })}` : '')
        );
      } else {
        return isFirst
          ? format(date, 'day', { variant: 'short' })
          : format(date, 'custom', { custom: DateToken.Hour_numeric });
      }
    } else if (+duration >= +new Duration({ duration: { minutes: 1 } })) {
      // Minutes
      const isFirst = i === 0 || +timeDay.floor(date) === +date;
      if (multiline) {
        return (
          format(date, 'time', { variant: 'short' }) +
          (isFirst ? `\n${format(date, 'day', { variant: 'short' })}` : '')
        );
      } else {
        return format(date, 'time', { variant: 'short' });
      }
    } else if (+duration >= +new Duration({ duration: { seconds: 1 } })) {
      // Seconds
      const isFirst = i === 0 || +timeDay.floor(date) === +date;
      return (
        format(date, 'time') +
        (multiline && isFirst ? `\n${format(date, 'day', { variant: 'short' })}` : '')
      );
    } else if (+duration >= +new Duration({ duration: { milliseconds: 1 } })) {
      // Milliseconds
      const isFirst = i === 0 || +timeDay.floor(date) === +date;
      return (
        format(date, 'custom', {
          custom: [
            DateToken.Hour_2Digit,
            DateToken.Minute_2Digit,
            DateToken.Second_2Digit,
            DateToken.MiliSecond_3,
            DateToken.Hour_woAMPM,
          ],
        }) + (multiline && isFirst ? `\n${format(date, 'day', { variant: 'short' })}` : '')
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
  ticks?: TicksConfig,
  count?: number,
  formatType?: FormatType,
  multiline = false
) {
  // Explicit format
  if (formatType) {
    return (tick: any) => format(tick, formatType);
  }

  // Time scale
  if (isScaleTime(scale) && count) {
    if (isLiteralObject(ticks) && 'interval' in ticks && ticks.interval != null) {
      const start = ticks.interval.floor(new Date());
      const end = ticks.interval.ceil(new Date());
      return getDurationFormat(new Duration({ start, end }), multiline);
    } else {
      // Compare first 2 ticks to determine duration between ticks for formatting
      const [start, end] = timeTicks(scale.domain()[0], scale.domain()[1], count);
      return getDurationFormat(new Duration({ start, end }), multiline);
    }
  }

  // Format from scale
  if (scale.tickFormat) {
    return scale.tickFormat(count);
  }

  return (tick: any) => `${tick}`;
}
