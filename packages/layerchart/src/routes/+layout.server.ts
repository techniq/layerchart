// import { env } from '$env/dynamic/private';

import themes from '../../themes.json';
import { getThemeNames } from 'svelte-ux/styles/theme.js';

export async function load() {
  return {
    themes: getThemeNames(themes),
    // pr_id: env.VERCEL_GIT_PULL_REQUEST_ID, // TODO: Re-add once SvelteKit updated to `2.3.2+` - https://github.com/sveltejs/kit/releases/tag/%40sveltejs%2Fkit%402.3.2
  };
}
