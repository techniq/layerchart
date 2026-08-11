import {
  timeYear,
  timeDay,
  timeHour,
  timeMillisecond,
  timeMinute,
  timeSecond,
  type TimeInterval,
  timeTicks,
  utcDay,
  utcHour,
  utcMillisecond,
  utcMinute,
  utcSecond,
  utcYear,
} from 'd3-time';

import {
  format,
  Duration,
  isLiteralObject,
  PeriodType,
  type FormatType,
  type FormatConfig,
  DateToken,
} from '@layerstack/utils';
import { isScaleBand, isScaleTime, isScaleUtc, type AnyScale } from './scales.svelte.js';
import type { AxisProps } from '$lib/components/Axis/Axis.svelte';

export function getDurationFormat(
  duration: Duration,
  options: { multiline?: boolean; placement?: AxisProps['placement'] } = {
    multiline: false,
  }
) {
  const { multiline = false, placement = 'bottom' } = options;

  return function (date: Date, i: number) {
    let result: string | Array<string | false> = '';

    if (+duration >= +new Duration({ duration: { years: 1 } })) {
      // Year
      result = format(date, 'year');
    } else if (+duration >= +new Duration({ duration: { days: 28 } })) {
      // Month
      const isFirst = i === 0 || +timeYear.floor(date) === +date;
      if (multiline) {
        result = [format(date, 'month', { variant: 'short' }), isFirst && format(date, 'year')];
      } else {
        result =
          format(date, 'month', { variant: 'short' }) +
          (isFirst ? ` '${format(date, 'year', { variant: 'short' })}` : '');
      }
    } else if (+duration >= +new Duration({ duration: { days: 1 } })) {
      // Day
      const isFirst = i === 0 || date.getDate() <= duration.days;
      if (multiline) {
        result = [
          format(date, 'custom', { custom: DateToken.DayOfMonth_numeric }),
          isFirst && format(date, 'month', { variant: 'short' }),
        ];
      } else {
        result = format(date, 'day', { variant: 'short' });
      }
    } else if (+duration >= +new Duration({ duration: { hours: 1 } })) {
      // Hours
      const isFirst = i === 0 || +timeDay.floor(date) === +date;
      if (multiline) {
        result = [
          format(date, 'custom', { custom: DateToken.Hour_numeric }),
          isFirst && format(date, 'day', { variant: 'short' }),
        ];
      } else {
        result = isFirst
          ? format(date, 'day', { variant: 'short' })
          : format(date, 'custom', { custom: DateToken.Hour_numeric });
      }
    } else if (+duration >= +new Duration({ duration: { minutes: 1 } })) {
      // Minutes
      const isFirst = i === 0 || +timeDay.floor(date) === +date;
      if (multiline) {
        result = [
          format(date, 'time', { variant: 'short' }),
          isFirst && format(date, 'day', { variant: 'short' }),
        ];
      } else {
        result = format(date, 'time', { variant: 'short' });
      }
    } else if (+duration >= +new Duration({ duration: { seconds: 1 } })) {
      // Seconds
      const isFirst = i === 0 || +timeDay.floor(date) === +date;
      result = [
        format(date, 'time'),
        multiline && isFirst && format(date, 'day', { variant: 'short' }),
      ];
    } else if (+duration >= +new Duration({ duration: { milliseconds: 1 } })) {
      // Milliseconds
      const isFirst = i === 0 || +timeDay.floor(date) === +date;
      result = [
        format(date, 'custom', {
          custom: [
            DateToken.Hour_2Digit,
            DateToken.Minute_2Digit,
            DateToken.Second_2Digit,
            DateToken.MiliSecond_3,
            DateToken.Hour_woAMPM,
          ],
        }),
        multiline && isFirst && format(date, 'day', { variant: 'short' }),
      ];
    } else {
      result = date.toString();
    }

    if (Array.isArray(result)) {
      switch (placement) {
        case 'top':
          return result.filter(Boolean).reverse().join('\n');
        case 'bottom':
          return result.filter(Boolean).join('\n');
        case 'left':
          return result.filter(Boolean).reverse().join(' ');
        case 'right':
          return result.filter(Boolean).join(' ');
        default:
          return result.filter(Boolean).join('\n');
      }
    } else {
      return result;
    }
  };
}

export type TicksConfig =
  | number
  | any[]
  | ((scale: AnyScale) => any[] | undefined)
  | { interval: TimeInterval | null }
  | null;

export function autoTickVals(scale: AnyScale, ticks?: TicksConfig, count?: number): any[] {
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
    const domain = scale.domain();
    const resolvedCount = typeof ticks === 'number' ? ticks : count;
    if (resolvedCount != null && resolvedCount < domain.length) {
      const step = Math.max(1, Math.ceil(domain.length / resolvedCount));
      return domain.filter((_, i) => i % step === 0);
    }
    return domain;
  }

  // Ticks from scale
  if (scale.ticks && typeof scale.ticks === 'function') {
    return scale.ticks(count ?? (typeof ticks === 'number' ? ticks : undefined));
  }

  return [];
}

/**
 * Keep only ticks that sit exactly on the boundary implied by the format type, so a day-formatted
 * axis doesn't repeat the same label on sub-day ticks.
 *
 * `utc` must match the scale: a `scaleUtc()` produces UTC-midnight ticks, which *local* intervals
 * never floor to (outside UTC itself) — filtering those with local intervals drops every tick.
 */
export function filterTicksByFormat<T>(
  tickVals: T[],
  formatType: FormatType | FormatConfig | undefined,
  options: { utc?: boolean } = {}
): T[] {
  const utc = options.utc ?? false;
  const type = isLiteralObject(formatType) ? (formatType as FormatConfig).type : formatType;

  const yearInterval = utc ? utcYear : timeYear;
  const dayInterval = utc ? utcDay : timeDay;
  const hourInterval = utc ? utcHour : timeHour;
  const minuteInterval = utc ? utcMinute : timeMinute;
  const secondInterval = utc ? utcSecond : timeSecond;
  const millisecondInterval = utc ? utcMillisecond : timeMillisecond;

  const onBoundary = (interval: TimeInterval) => (val: any) => +interval.floor(val) === +val;

  if (type === 'integer') {
    return tickVals.filter(Number.isInteger as any);
  } else if (type === 'year' || type === PeriodType.CalendarYear) {
    return tickVals.filter(onBoundary(yearInterval));
  } else if (type === 'month' || type === PeriodType.Month || type === PeriodType.MonthYear) {
    // first week of the month
    return tickVals.filter((val: any) => (utc ? val.getUTCDate() : val.getDate()) < 7);
  } else if (type === 'day' || type === PeriodType.Day) {
    return tickVals.filter(onBoundary(dayInterval));
  } else if (type === 'hour' || type === PeriodType.Hour) {
    return tickVals.filter(onBoundary(hourInterval));
  } else if (type === 'minute' || type === PeriodType.Minute) {
    return tickVals.filter(onBoundary(minuteInterval));
  } else if (type === 'second' || type === PeriodType.Second) {
    return tickVals.filter(onBoundary(secondInterval));
  } else if (type === 'millisecond' || type === PeriodType.Millisecond) {
    return tickVals.filter(onBoundary(millisecondInterval));
  }

  return tickVals;
}

export function autoTickFormat(options: {
  scale: AnyScale;
  ticks?: TicksConfig;
  count?: number;
  formatType?: FormatType | FormatConfig;
  multiline?: boolean;
  placement?: AxisProps['placement'];
}) {
  const { scale, ticks, count, formatType, multiline, placement } = options;

  // Explicit format
  if (formatType) {
    // A UTC scale's ticks are UTC instants, so they have to be *rendered* in UTC too — otherwise
    // a tick at UTC midnight prints the previous local day and silently sits under the wrong label.
    if (isScaleUtc(scale)) {
      const config: FormatConfig = isLiteralObject(formatType)
        ? (formatType as FormatConfig)
        : ({ type: formatType } as FormatConfig);

      return (tick: any) =>
        // @ts-expect-error - improve types
        format(tick, { ...config, options: { ...config.options, utc: true } });
    }

    // @ts-expect-error - improve types
    return (tick: any) => format(tick, formatType);
  }

  // Time scale
  if (isScaleTime(scale) && count) {
    if (isLiteralObject(ticks) && 'interval' in ticks && ticks.interval != null) {
      const start = ticks.interval.floor(new Date());
      const end = ticks.interval.ceil(new Date());
      return getDurationFormat(new Duration({ start, end }), { multiline, placement });
    } else {
      // Compare first 2 ticks to determine duration between ticks for formatting
      const [start, end] = timeTicks(scale.domain()[0], scale.domain()[1], count);
      return getDurationFormat(new Duration({ start, end }), { multiline, placement });
    }
  }

  // Format from scale
  if (scale.tickFormat) {
    return scale.tickFormat(count);
  }

  return (tick: any) => `${tick}`;
}
