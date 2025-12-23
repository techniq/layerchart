import { defineConfig } from 'unocss';
import { presetWind4 } from '@unocss/preset-wind4';

export default defineConfig({
	presets: [
		presetWind4({
			preflights: {
				reset: false,
				theme: {
					mode: true // Generate all theme CSS variables (or use 'on-demand')
				}
			}
		})
	]
});
