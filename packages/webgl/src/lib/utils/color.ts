import { Color, SRGBColorSpace } from 'three';

export type ResolvedColor = { color: Color; opacity: number };

/**
 * What a mark's CSS classes (ex. `fill-red-500 opacity-50`) set, as the core `Canvas` layer
 * reads them: `null` for what they leave alone
 */
export type ClassStyle = {
  /** The fill its classes set, or the `--fill-color` LayerChart's styles give its marks */
  fill: string | null;
  stroke: string | null;
  /**
   * Whether its classes set the fill itself (ex. `fill-primary/20`), which wins over a mark's
   * `fill` prop as CSS wins over an SVG attribute in core's layers, rather than a
   * `--fill-color` default, which doesn't
   */
  fillSet: boolean;
  strokeSet: boolean;
  strokeWidth: number | null;
  opacity: number;
  /** Its `mix-blend-mode`, when not `normal` (ex. `plus-lighter`) */
  blend: string | null;
  /** Its font size in pixels: its class's (ex. `text-xs`), else what it inherits there */
  fontSize: number;
  /** Its font weight: its class's (ex. `font-semibold`), else what it inherits there */
  fontWeight: string;
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
  /** Each class and attribute set read, by its key, with what it read */
  #styles = new Map<
    string,
    { classes: string; attributes?: Record<string, string>; style: ClassStyle }
  >();
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
    for (const entry of this.#styles.values()) {
      const next = this.#read(entry.classes, entry.attributes);
      if (JSON.stringify(next) === JSON.stringify(entry.style)) continue;
      entry.style = next;
      changed = true;
    }
    return changed;
  }

  /**
   * What `classes` set on an SVG shape here (see `ClassStyle`), with its `attributes` (ex. a
   * label's `data-placement`, which LayerChart's styles read)
   */
  style(classes: string, attributes?: Record<string, string>): ClassStyle {
    const key = attributes ? `${classes}\u0000${JSON.stringify(attributes)}` : classes;
    let entry = this.#styles.get(key);
    if (!entry) {
      entry = { classes, attributes, style: this.#read(classes, attributes) };
      this.#styles.set(key, entry);
    }
    return entry.style;
  }

  #read(classes: string, attributes?: Record<string, string>): ClassStyle {
    if (!this.#classed || !this.#plain) {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.style.display = 'none';
      // Defaults no class sets (ex. not black, SVG's own fill, which `fill-black` sets), so a
      // class setting one is told from none
      svg.style.fill = 'rgb(1, 2, 3)';
      svg.style.stroke = 'rgb(3, 2, 1)';
      // Not 1px, SVG's own, which `stroke-1` sets
      svg.style.strokeWidth = '1.0625px';
      this.#classed = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      this.#plain = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      svg.append(this.#classed, this.#plain);
      this.#probe.append(svg);
    }
    this.#classed.setAttribute('class', classes);
    for (const name of [...this.#classed.getAttributeNames()]) {
      if (name !== 'class') this.#classed.removeAttribute(name);
    }
    for (const [name, value] of Object.entries(attributes ?? {})) {
      this.#classed.setAttribute(name, value);
    }
    const style = getComputedStyle(this.#classed);
    const plain = getComputedStyle(this.#plain);
    const set = (key: 'fill' | 'stroke' | 'strokeWidth') =>
      style[key] !== plain[key] ? style[key] : null;
    /**
     * A color the classes set as LayerChart's do for their marks (ex. `.lc-highlight-area`'s
     * `--fill-color`), which its SVG primitives read
     */
    const variable = (name: '--fill-color' | '--stroke-color') => {
      const value = style.getPropertyValue(name).trim();
      return value && value !== plain.getPropertyValue(name).trim() ? value : null;
    };
    const strokeWidth = set('strokeWidth');
    const fill = set('fill');
    // `stroke-none` as no stroke at all, as before the probe had one to tell it from
    const stroke = set('stroke') === 'none' ? null : set('stroke');
    return {
      fill: fill ?? variable('--fill-color'),
      stroke: stroke ?? variable('--stroke-color'),
      fillSet: fill != null,
      strokeSet: stroke != null,
      strokeWidth: strokeWidth == null ? null : parseFloat(strokeWidth),
      opacity: Number(style.opacity) * Number(style.fillOpacity || 1),
      blend: style.mixBlendMode && style.mixBlendMode !== 'normal' ? style.mixBlendMode : null,
      fontSize: parseFloat(style.fontSize),
      fontWeight: style.fontWeight,
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
