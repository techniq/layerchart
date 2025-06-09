import { type TimeInterval } from 'd3-time';

/**
 * Get the date at the end of the interval
 * Similar to `interval.ceil(date)` except:
 *   - returns end of day instead of start of next day
 *   - properly handles start of day (i.e. not return same date)
 */
export function endOfInterval(date: Date, interval: TimeInterval) {
  // Can not use `new Date(+interval.ceil(date) - 1)`; as `.ceil()` will return same date when start of the day (matching `.floor()`)
  return new Date(interval.offset(interval.floor(date), 1).getTime() - 1);
}
