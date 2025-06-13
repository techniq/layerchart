---
'layerchart': patch
---

feat: Support passing `PeriodTypeCode` strings for simplified date formatting and reduce imports. Example: `format={PeriodType.Day}` is now `format="day"`. Also supported with config object for passing additional options (ex. `format={{ type: 'day', options: { variant: 'long' } }}`). Supported for all `format` props include Axis, Labels, Legend and Tooltip.
