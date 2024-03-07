import {
  timeYear,
  timeMonth,
  timeWeek,
  timeDay,
  timeHour,
  timeMinute,
  timeSecond,
  timeMillisecond,
} from 'd3-time';
import { format } from 'date-fns';

import { formatDate, PeriodType, getDuration } from 'svelte-ux';
import { fail } from 'svelte-ux';

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
    format: (date: Date) => formatDate(date, PeriodType.CalendarYear, { variant: 'short' }),
  },
  {
    predicate: (duration: Duration) => duration!.years,
    interval: timeMonth.every(1),
    format: (date: Date) => formatDate(date, PeriodType.Month, { variant: 'short' }),
  },
  {
    predicate: (duration: Duration) => duration!.days > 30,
    interval: timeMonth.every(1),
    format: (date: Date) => formatDate(date, PeriodType.Month, { variant: 'short' }),
  },
  {
    predicate: (duration: Duration) => duration!.days,
    interval: timeDay.every(1),
    format: (date: Date) => formatDate(date, PeriodType.Day, { variant: 'short' }),
  },
  {
    predicate: (duration: Duration) => duration!.hours,
    interval: timeHour.every(1),
    format: (date: Date) => format(date, 'h:mm a'),
  },
  {
    predicate: (duration: Duration) => duration!.minutes > 10,
    interval: timeMinute.every(10),
    format: (date: Date) => format(date, 'h:mm a'),
  },
  {
    predicate: (duration: Duration) => duration!.minutes,
    interval: timeMinute.every(1),
    format: (date: Date) => format(date, 'h:mm a'),
  },
  {
    predicate: (duration: Duration) => duration!.seconds > 10,
    interval: timeSecond.every(10),
    format: (date: Date) => format(date, 'h:mm:ss'),
  },
  {
    predicate: (duration: Duration) => duration!.seconds,
    interval: timeSecond.every(1),
    format: (date: Date) => format(date, 'h:mm:ss'),
  },
  {
    predicate: (duration: Duration) => true, // 0 or more milliseconds
    interval: timeMillisecond.every(100),
    format: (date: Date) => format(date, 'h:mm:ss.SSS'),
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
    format: (date: Date) => formatDate(date, PeriodType.Month, { variant: 'short' }),
  },
  {
    predicate: (duration: Duration) => duration!.days > 90,
    interval: timeMonth.every(1),
    format: (date: Date) => formatDate(date, PeriodType.Month, { variant: 'short' }),
  },
  {
    predicate: (duration: Duration) => duration!.days > 30,
    interval: timeWeek.every(1),
    format: (date: Date) => formatDate(date, PeriodType.WeekSun, { variant: 'short' }),
  },
  {
    predicate: (duration: Duration) => duration!.days > 7,
    interval: timeDay.every(1),
    format: (date: Date) => formatDate(date, PeriodType.Day, { variant: 'short' }),
  },
  {
    predicate: (duration: Duration) => duration!.days > 3,
    interval: timeHour.every(8),
    format: (date: Date) => format(date, 'h:mm a'),
  },
  {
    predicate: (duration: Duration) => duration!.days,
    interval: timeHour.every(1),
    format: (date: Date) => format(date, 'h:mm a'),
  },
  {
    predicate: (duration: Duration) => duration!.hours,
    interval: timeMinute.every(15),
    format: (date: Date) => format(date, 'h:mm a'),
  },
  {
    predicate: (duration: Duration) => duration!.minutes > 10,
    interval: timeMinute.every(10),
    format: (date: Date) => format(date, 'h:mm a'),
  },
  {
    predicate: (duration: Duration) => duration!.minutes > 2,
    interval: timeMinute.every(1),
    format: (date: Date) => format(date, 'h:mm a'),
  },
  {
    predicate: (duration: Duration) => duration!.minutes,
    interval: timeSecond.every(10),
    format: (date: Date) => format(date, 'h:mm:ss'),
  },
  {
    predicate: (duration: Duration) => duration!.seconds,
    interval: timeSecond.every(1),
    format: (date: Date) => format(date, 'h:mm:ss'),
  },
  {
    predicate: (duration: Duration) => true, // 0 or more milliseconds
    interval: timeMillisecond.every(10),
    format: (date: Date) => format(date, 'h:mm:ss.SSS'),
  },
];

export function getMajorTicks(start: Date, end: Date) {
  const duration = getDuration(start, end);

  for (var t of majorTicks) {
    if (t.predicate(duration)) {
      return t.interval;
    }
  }

  fail(`Unable to locate major ticks for duration: ${duration}`);
}

export function formatMajorTick(date: Date, rangeStart: Date, rangeEnd: Date) {
  const duration = getDuration(rangeStart, rangeEnd);

  for (var t of majorTicks) {
    if (t.predicate(duration)) {
      return t.format(date);
    }
  }

  fail(`Unable to format major ticks for duration: ${duration}`);
}

export function getMinorTicks(start: Date, end: Date) {
  const duration = getDuration(start, end);

  for (var t of minorTicks) {
    if (t.predicate(duration)) {
      return t.interval;
    }
  }

  fail(`Unable to locate minor ticks for duration: ${duration}`);
}
