---
title: "layerchart@0.33.0"
tag: "layerchart@0.33.0"
date: "2024-03-18T12:02:21Z"
url: "https://github.com/techniq/layerchart/releases/tag/layerchart%400.33.0"
draft: false
prerelease: false
author: "github-actions[bot]"
---
### Minor Changes

-   Change default Chart tooltip mode from `bisect-x` to `manual` (now that tooltip context is always setup) ([`6399d54f7a3a7777c98f93c4ad592a4fddd5a9e9`](https://github.com/techniq/layerchart/commit/6399d54f7a3a7777c98f93c4ad592a4fddd5a9e9))

-   Rename `Zoom` component to `Transform` ([`8d5ac6689ea79dcadef86b342cd7f3ad9d6f545a`](https://github.com/techniq/layerchart/commit/8d5ac6689ea79dcadef86b342cd7f3ad9d6f545a))

### Patch Changes

-   Always add TooltipContext to fix `let:tooltip` slot prop ([`10a9468efc90179e4446cc17df82a420d2033b53`](https://github.com/techniq/layerchart/commit/10a9468efc90179e4446cc17df82a420d2033b53))

-   [Zoom] Fix tooltip triggering and text seleciton while dragging ([`db339ac837811b842fbe2fb781c8ad0ae059c365`](https://github.com/techniq/layerchart/commit/db339ac837811b842fbe2fb781c8ad0ae059c365))

-   [GeoContext] Fix `fitGeojson` not defined and support `reflectX` and `reflectY` ([`dbab632808fd8a5d230a46b062652af687aefac0`](https://github.com/techniq/layerchart/commit/dbab632808fd8a5d230a46b062652af687aefac0))

-   Update dependencies ([`5892607f7e721bf255c6d5b2c31c45476965820e`](https://github.com/techniq/layerchart/commit/5892607f7e721bf255c6d5b2c31c45476965820e))

-   [Transform] Add `dragstart` and `dragend` events ([`e41c5e678c2e1c1c72e2146b1b47dbbeed68ff38`](https://github.com/techniq/layerchart/commit/e41c5e678c2e1c1c72e2146b1b47dbbeed68ff38))
