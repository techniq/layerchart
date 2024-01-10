import { env } from '$env/dynamic/private';

import themes from '../../themes.json';
import { getThemeNames } from 'svelte-ux/styles/theme';

export async function load() {
  return {
    themes: getThemeNames(themes),
    pr_id: env.VERCEL_GIT_PULL_REQUEST_ID,
  };
}
