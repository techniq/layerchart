import { getThemeNames } from '@layerstack/tailwind';
import themeCss from '@layerstack/tailwind/themes/all.css?raw';
// import { env } from '$env/dynamic/private';

export async function load() {
  return {
    themes: getThemeNames(themeCss),
    // pr_id: env.VERCEL_GIT_PULL_REQUEST_ID, // TODO: Re-add once SvelteKit updated to `2.3.2+` - https://github.com/sveltejs/kit/releases/tag/%40sveltejs%2Fkit%402.3.2
  };
}
