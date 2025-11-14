import { timeYear, timeDay, type TimeInterval, timeTicks } from 'd3-time';

import {
  format,
  Duration,
  isLiteralObject,
  type FormatType,
  type FormatConfig,
  DateToken,
} from '@layerstack/utils';
import { isScaleBand, isScaleTime, type AnyScale } from './scales.svelte.js';
import type { AxisProps } from '$lib/components/Axis.svelte';

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
