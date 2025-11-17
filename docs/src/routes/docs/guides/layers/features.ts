export const graphics = [
	{
		feature: 'line',
		html: {
			support: true
		},
		svg: {
			support: true
		},
		canvas: {
			support: true
		},
		webgl: {
			support: true
		}
	},
	{
		feature: 'rectangle',
		html: {
			support: true
		},
		svg: {
			support: true
		},
		canvas: {
			support: true
		},
		webgl: {
			support: true
		}
	},
	{
		feature: 'circle',
		html: {
			support: true
		},
		svg: {
			support: true
		},
		canvas: {
			support: true
		},
		webgl: {
			support: true
		}
	},
	{
		feature: 'ellipse',
		html: {
			support: true
		},
		svg: {
			support: true
		},
		canvas: {
			support: true
		},
		webgl: {
			support: true
		}
	},
	{
		feature: 'path',
		html: {
			support: false
		},
		svg: {
			support: true
		},
		canvas: {
			support: true
		},
		webgl: {
			support: true
		}
	},
	{
		feature: 'text',
		html: {
			support: true
		},
		svg: {
			support: true
		},
		canvas: {
			support: true
		},
		webgl: {
			support: true
		}
	},
	{
		feature: 'image',
		html: {
			support: true
		},
		svg: {
			support: true
		},
		canvas: {
			support: true
		},
		webgl: {
			support: true
		}
	}
];

export const styles = [
	{
		feature: 'hover styling',
		html: {
			support: true
		},
		svg: {
			support: true
		},
		canvas: {
			support: false,
			note: 'LayerChart uses a HitCanvas to provide pointer events, but no `hover:` styling out of the box'
		},
		webgl: {
			support: false
		}
	},
	{
		feature: 'CSS pseudo (first-child, etc)',
		html: {
			support: true
		},
		svg: {
			support: true
		},
		canvas: {
			support: false
		},
		webgl: {
			support: false
		}
	},
	{
		feature: 'path/point markers',
		html: {
			support: false
		},
		svg: {
			support: true,
			link: 'https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/marker'
		},
		canvas: {
			support: false
		},
		webgl: {
			support: false
		}
	},
	{
		feature: 'clipping',
		html: {
			support: true,
			note: 'clip-path: ...',
			link: 'https://developer.mozilla.org/en-US/docs/Web/CSS/clip-path'
		},
		svg: {
			support: true,
			note: '<clipPath>',
			link: 'https://developer.mozilla.org/en-US/docs/Web/SVG/Element/clipPath'
		},
		canvas: {
			support: true,
			note: 'ctx.clip()',
			link: 'https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/clip'
		},
		webgl: {
			support: false,
			note: 'Requires custom shader implementation'
		}
	},
	{
		feature: 'inset borders',
		html: {
			support: true
		},
		svg: {
			support: false,
			note: 'Workaround via `<clipPath>` and 2x stroke',
			link: 'https://svelte.dev/playground/00fdbf89041340fe9e57c4e83b87ff2a?version=5.25.8'
		},
		canvas: {
			support: false,
			note: 'Workaround via `ctx.clip()` and 2x stroke',
			link: 'https://stackoverflow.com/questions/36615592/canvas-inner-stroke'
		},
		webgl: {
			support: false
		}
	},
	{
		feature: 'stroke / border / outline',
		html: {
			support: true,
			note: `
        border: inside
        outline: outside
      `
		},
		svg: {
			support: false,
			note: 'stroke: along (1/2 in/out)'
		},
		canvas: {
			support: false,
			note: 'stroke: along (1/2 in/out)'
		},
		webgl: {
			support: false
		}
	},
	{
		feature: 'Transitions (`in:`, `out:`)',
		html: {
			support: true
		},
		svg: {
			support: true
		},
		canvas: {
			support: false
		},
		webgl: {
			support: false
		}
	}
] as const;

export const text = [
	{
		feature: 'multiline wrapping',
		html: {
			support: true
		},
		svg: {
			support: false
		},
		canvas: {
			support: false
		},
		webgl: {
			support: false
		}
	},
	{
		feature: 'truncation',
		html: {
			support: true
		},
		svg: {
			support: false
		},
		canvas: {
			support: false
		},
		webgl: {
			support: false
		}
	},
	{
		feature: 'text path',
		html: {
			support: false
		},
		svg: {
			support: true
		},
		canvas: {
			support: false
		},
		webgl: {
			support: false
		}
	},
	{
		feature: 'background',
		html: {
			support: true
		},
		svg: {
			support: false,
			note: 'Hacky way with `<filter>` but no padding, gradient, etc',
			link: 'https://svelte.dev/playground/6713b04bc8274b6dbf6b7487fdd80404?version=5.28.2'
		},
		canvas: {
			support: false
		},
		webgl: {
			support: false
		}
	}
] as const;

export const gradient = [
	{
		feature: 'linear gradient',
		html: {
			support: true
		},
		svg: {
			support: true
		},
		canvas: {
			support: true
		},
		webgl: {
			support: false,
			note: 'Requires custom shader implementation',
			link: 'https://stackoverflow.com/questions/47376499/creating-a-gradient-color-in-fragment-shader/47379071#47379071'
		}
	},
	{
		feature: 'radial gradient',
		html: {
			support: true
		},
		svg: {
			support: true
		},
		canvas: {
			support: true
		},
		webgl: {
			support: false,
			note: 'Requires custom shader implementation',
			link: 'https://stackoverflow.com/questions/47376499/creating-a-gradient-color-in-fragment-shader/47379071#47379071'
		}
	},
	{
		feature: 'conic gradient',
		html: {
			support: true
		},
		svg: {
			support: false
		},
		canvas: {
			support: true
		},
		webgl: {
			support: false,
			note: 'Requires custom shader implementation',
			link: 'https://stackoverflow.com/questions/47376499/creating-a-gradient-color-in-fragment-shader/47379071#47379071'
		}
	}
];

export const other = [
	{
		feature: 'Extend past bounds',
		html: {
			support: true
		},
		svg: {
			support: true
		},
		canvas: {
			support: false
		},
		webgl: {
			support: false
		}
	},
	{
		feature: 'Performance optimized',
		html: {
			support: false
		},
		svg: {
			support: false
		},
		canvas: {
			support: true
		},
		webgl: {
			support: true
		}
	}
];
