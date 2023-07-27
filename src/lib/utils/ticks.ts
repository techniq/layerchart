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

import { formatDate, PeriodType } from 'svelte-ux/utils/date';
import { getDuration, type Duration } from 'svelte-ux/utils/duration';
import { fail } from 'svelte-ux';

// TODO: Use PeriodType along with Duration to format (and possibly select intervals)

const majorTicks = [
  {
    predicate: (duration: Duration | null) => duration == null, // Unknown
    interval: timeYear.every(1), // Better than rendering a lot of items
    format: (date: Date) => date.toString(),
  },
  {
    predicate: (duration: Duration | null) => duration!.years > 1,
    interval: timeYear.every(1),
    format: (date: Date) => formatDate(date, PeriodType.CalendarYear, 'short'),
  },
  {
    predicate: (duration: Duration | null) => duration!.years,
    interval: timeMonth.every(1),
    format: (date: Date) => formatDate(date, PeriodType.Month, 'short'),
  },
  {
    predicate: (duration: Duration | null) => duration!.days > 30,
    interval: timeMonth.every(1),
    format: (date: Date) => formatDate(date, PeriodType.Month, 'short'),
  },
  {
    predicate: (duration: Duration | null) => duration!.days,
    interval: timeDay.every(1),
    format: (date: Date) => formatDate(date, PeriodType.Day, 'short'),
  },
  {
    predicate: (duration: Duration | null) => duration!.hours,
    interval: timeHour.every(1),
    format: (date: Date) => format(date, 'h:mm a'),
  },
  {
    predicate: (duration: Duration | null) => duration!.minutes > 10,
    interval: timeMinute.every(10),
    format: (date: Date) => format(date, 'h:mm a'),
  },
  {
    predicate: (duration: Duration | null) => duration!.minutes,
    interval: timeMinute.every(1),
    format: (date: Date) => format(date, 'h:mm a'),
  },
  {
    predicate: (duration: Duration | null) => duration!.seconds > 10,
    interval: timeSecond.every(10),
    format: (date: Date) => format(date, 'h:mm:ss'),
  },
  {
    predicate: (duration: Duration | null) => duration!.seconds,
    interval: timeSecond.every(1),
    format: (date: Date) => format(date, 'h:mm:ss'),
  },
  {
    predicate: (duration: Duration | null) => true, // 0 or more milliseconds
    interval: timeMillisecond.every(100),
    format: (date: Date) => format(date, 'h:mm:ss.SSS'),
  },
];

const minorTicks = [
  {
    predicate: (duration: Duration | null) => duration == null, // Unknown
    interval: timeYear.every(1), // Better than rendering a lot of items
    format: (date: Date) => date.toString(),
  },
  {
    predicate: (duration: Duration | null) => duration!.years,
    interval: timeMonth.every(1),
    format: (date: Date) => formatDate(date, PeriodType.Month, 'short'),
  },
  {
    predicate: (duration: Duration | null) => duration!.days > 90,
    interval: timeMonth.every(1),
    format: (date: Date) => formatDate(date, PeriodType.Month, 'short'),
  },
  {
    predicate: (duration: Duration | null) => duration!.days > 30,
    interval: timeWeek.every(1),
    format: (date: Date) => formatDate(date, PeriodType.WeekSun, 'short'),
  },
  {
    predicate: (duration: Duration | null) => duration!.days > 7,
    interval: timeDay.every(1),
    format: (date: Date) => formatDate(date, PeriodType.Day, 'short'),
  },
  {
    predicate: (duration: Duration | null) => duration!.days > 3,
    interval: timeHour.every(8),
    format: (date: Date) => format(date, 'h:mm a'),
  },
  {
    predicate: (duration: Duration | null) => duration!.days,
    interval: timeHour.every(1),
    format: (date: Date) => format(date, 'h:mm a'),
  },
  {
    predicate: (duration: Duration | null) => duration!.hours,
    interval: timeMinute.every(15),
    format: (date: Date) => format(date, 'h:mm a'),
  },
  {
    predicate: (duration: Duration | null) => duration!.minutes > 10,
    interval: timeMinute.every(10),
    format: (date: Date) => format(date, 'h:mm a'),
  },
  {
    predicate: (duration: Duration | null) => duration!.minutes > 2,
    interval: timeMinute.every(1),
    format: (date: Date) => format(date, 'h:mm a'),
  },
  {
    predicate: (duration: Duration | null) => duration!.minutes,
    interval: timeSecond.every(10),
    format: (date: Date) => format(date, 'h:mm:ss'),
  },
  {
    predicate: (duration: Duration | null) => duration!.seconds,
    interval: timeSecond.every(1),
    format: (date: Date) => format(date, 'h:mm:ss'),
  },
  {
    predicate: (duration: Duration | null) => true, // 0 or more milliseconds
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
