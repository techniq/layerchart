# Thoughts

## Half-Aria Props

Do we need all the extra `labelledby` `label` and `describedBy` props? We should just rely on the browser attributes (`aria-labelledby`, `aria-label`, `aria-describedby`) to do the work for us.

Having these attributes in the props is redundant and can be confusing to users as to which prop takes precedence.
