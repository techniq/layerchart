import { Color, SRGBColorSpace } from 'three';

export type ResolvedColor = { color: Color; opacity: number };

/**
 * What a mark's CSS classes (ex. `fill-red-500 opacity-50`) set, as LayerChart's `Canvas` layer
 * reads them: `null` for what they leave alone
 */
export type ClassStyle = {
  fill: string | null;
  stroke: string | null;
  strokeWidth: number | null;
  opacity: number;
  /** Its `mix-blend-mode`, when not `normal` (ex. `plus-lighter`) */
  blend: string | null;
};

/**
 * Turns CSS colors — including `var(--color-primary)`, `oklch(...)`, and `color-mix(...)` — into
 * three.js colors, as the browser resolves them for `probe`.  three.js parses neither custom
 * properties nor CSS Color 4 spaces, so each is painted onto a 1×1 canvas and read back as sRGB.
 */
export class ColorResolver {
  #probe: HTMLElement;
  #context: CanvasRenderingContext2D | null = null;
  #cache = new Map<string, ResolvedColor>();
  #styles = new Map<string, ClassStyle>();
  /** An SVG path to give classes to and read back, and one without, to tell what they set */
  #classed: SVGPathElement | null = null;
  #plain: SVGPathElement | null = null;

  constructor(probe: HTMLElement) {
    this.#probe = probe;
  }

  /**
   * Resolve every color seen so far again, ex. after something that might be a theme change, and
   * say whether any came out different
   */
  refresh(): boolean {
    let changed = false;
    for (const [value, previous] of this.#cache) {
      const next = this.#paint(value);
      if (next.color.equals(previous.color) && next.opacity === previous.opacity) continue;
      this.#cache.set(value, next);
      changed = true;
    }
    for (const [classes, previous] of this.#styles) {
      const next = this.#read(classes);
      if (JSON.stringify(next) === JSON.stringify(previous)) continue;
      this.#styles.set(classes, next);
      changed = true;
    }
    return changed;
  }

  /** What `classes` set on an SVG shape here (see `ClassStyle`) */
  style(classes: string): ClassStyle {
    let style = this.#styles.get(classes);
    if (!style) {
      style = this.#read(classes);
      this.#styles.set(classes, style);
    }
    return style;
  }

  #read(classes: string): ClassStyle {
    if (!this.#classed || !this.#plain) {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.style.display = 'none';
      this.#classed = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      this.#plain = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      svg.append(this.#classed, this.#plain);
      this.#probe.append(svg);
    }
    this.#classed.setAttribute('class', classes);
    const style = getComputedStyle(this.#classed);
    const plain = getComputedStyle(this.#plain);
    const set = (key: 'fill' | 'stroke' | 'strokeWidth') =>
      style[key] !== plain[key] ? style[key] : null;
    const strokeWidth = set('strokeWidth');
    return {
      fill: set('fill'),
      stroke: set('stroke'),
      strokeWidth: strokeWidth == null ? null : parseFloat(strokeWidth),
      opacity: Number(style.opacity) * Number(style.fillOpacity || 1),
      blend: style.mixBlendMode && style.mixBlendMode !== 'normal' ? style.mixBlendMode : null,
    };
  }

  resolve(value: string): ResolvedColor {
    let resolved = this.#cache.get(value);
    if (!resolved) {
      resolved = this.#paint(value);
      this.#cache.set(value, resolved);
    }
    return resolved;
  }

  #paint(value: string): ResolvedColor {
    // Custom properties resolve against the probe, so they follow the chart's theme and scope
    this.#probe.style.color = '';
    this.#probe.style.color = value;
    const computed = getComputedStyle(this.#probe).color;

    if (!this.#context) {
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = 1;
      this.#context = canvas.getContext('2d', { willReadFrequently: true });
    }
    const context = this.#context;
    if (!context) return { color: new Color(computed), opacity: 1 };

    context.clearRect(0, 0, 1, 1);
    context.fillStyle = computed;
    context.fillRect(0, 0, 1, 1);
    const [r, g, b, a] = context.getImageData(0, 0, 1, 1).data;
    return {
      color: new Color().setRGB(r / 255, g / 255, b / 255, SRGBColorSpace),
      opacity: a / 255,
    };
  }
}
