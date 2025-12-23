import { defineConfig } from 'unocss';
import { presetWind4 } from '@unocss/preset-wind4';

export default defineConfig({
	presets: [
		presetWind4({
			preflights: {
				theme: {
					mode: true // Generate all theme CSS variables (or use 'on-demand')
				}
			}
		})
	]
});
