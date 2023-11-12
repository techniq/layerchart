import { timeYear, timeMonth, timeWeek, timeDay, timeHour, timeMinute, timeSecond, timeMillisecond } from 'd3-time';
import { format } from 'date-fns';
import { formatDate, PeriodType } from 'svelte-ux/utils/date';
import { getDuration } from 'svelte-ux/utils/duration';
import { fail } from 'svelte-ux/types';
// TODO: Use PeriodType along with Duration to format (and possibly select intervals)
const majorTicks = [
    {
        predicate: (duration) => duration == null,
        interval: timeYear.every(1),
        format: (date) => date.toString()
    },
    {
        predicate: (duration) => duration.years > 1,
        interval: timeYear.every(1),
        format: (date) => formatDate(date, PeriodType.CalendarYear, 'short')
    },
    {
        predicate: (duration) => duration.years,
        interval: timeMonth.every(1),
        format: (date) => formatDate(date, PeriodType.Month, 'short')
    },
    {
        predicate: (duration) => duration.days > 30,
        interval: timeMonth.every(1),
        format: (date) => formatDate(date, PeriodType.Month, 'short')
    },
    {
        predicate: (duration) => duration.days,
        interval: timeDay.every(1),
        format: (date) => formatDate(date, PeriodType.Day, 'short')
    },
    {
        predicate: (duration) => duration.hours,
        interval: timeHour.every(1),
        format: (date) => format(date, 'h:mm a')
    },
    {
        predicate: (duration) => duration.minutes > 10,
        interval: timeMinute.every(10),
        format: (date) => format(date, 'h:mm a')
    },
    {
        predicate: (duration) => duration.minutes,
        interval: timeMinute.every(1),
        format: (date) => format(date, 'h:mm a')
    },
    {
        predicate: (duration) => duration.seconds > 10,
        interval: timeSecond.every(10),
        format: (date) => format(date, 'h:mm:ss')
    },
    {
        predicate: (duration) => duration.seconds,
        interval: timeSecond.every(1),
        format: (date) => format(date, 'h:mm:ss')
    },
    {
        predicate: (duration) => true,
        interval: timeMillisecond.every(100),
        format: (date) => format(date, 'h:mm:ss.SSS')
    }
];
const minorTicks = [
    {
        predicate: (duration) => duration == null,
        interval: timeYear.every(1),
        format: (date) => date.toString()
    },
    {
        predicate: (duration) => duration.years,
        interval: timeMonth.every(1),
        format: (date) => formatDate(date, PeriodType.Month, 'short')
    },
    {
        predicate: (duration) => duration.days > 90,
        interval: timeMonth.every(1),
        format: (date) => formatDate(date, PeriodType.Month, 'short')
    },
    {
        predicate: (duration) => duration.days > 30,
        interval: timeWeek.every(1),
        format: (date) => formatDate(date, PeriodType.WeekSun, 'short')
    },
    {
        predicate: (duration) => duration.days > 7,
        interval: timeDay.every(1),
        format: (date) => formatDate(date, PeriodType.Day, 'short')
    },
    {
        predicate: (duration) => duration.days > 3,
        interval: timeHour.every(8),
        format: (date) => format(date, 'h:mm a')
    },
    {
        predicate: (duration) => duration.days,
        interval: timeHour.every(1),
        format: (date) => format(date, 'h:mm a')
    },
    {
        predicate: (duration) => duration.hours,
        interval: timeMinute.every(15),
        format: (date) => format(date, 'h:mm a')
    },
    {
        predicate: (duration) => duration.minutes > 10,
        interval: timeMinute.every(10),
        format: (date) => format(date, 'h:mm a')
    },
    {
        predicate: (duration) => duration.minutes > 2,
        interval: timeMinute.every(1),
        format: (date) => format(date, 'h:mm a')
    },
    {
        predicate: (duration) => duration.minutes,
        interval: timeSecond.every(10),
        format: (date) => format(date, 'h:mm:ss')
    },
    {
        predicate: (duration) => duration.seconds,
        interval: timeSecond.every(1),
        format: (date) => format(date, 'h:mm:ss')
    },
    {
        predicate: (duration) => true,
        interval: timeMillisecond.every(10),
        format: (date) => format(date, 'h:mm:ss.SSS')
    }
];
export function getMajorTicks(start, end) {
    const duration = getDuration(start, end);
    for (var t of majorTicks) {
        if (t.predicate(duration)) {
            return t.interval;
        }
    }
    fail(`Unable to locate major ticks for duration: ${duration}`);
}
export function formatMajorTick(date, rangeStart, rangeEnd) {
    const duration = getDuration(rangeStart, rangeEnd);
    for (var t of majorTicks) {
        if (t.predicate(duration)) {
            return t.format(date);
        }
    }
    fail(`Unable to format major ticks for duration: ${duration}`);
}
export function getMinorTicks(start, end) {
    const duration = getDuration(start, end);
    for (var t of minorTicks) {
        if (t.predicate(duration)) {
            return t.interval;
        }
    }
    fail(`Unable to locate minor ticks for duration: ${duration}`);
}
