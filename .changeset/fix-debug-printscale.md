---
"layerchart": patch
---

fix: guard against undefined accessor in printScale

When activeGetters includes z or r scales that are not configured, the accessor is undefined, causing acc.toString() to throw. Added null check.
