import { Color, SRGBColorSpace } from 'three';

export type ResolvedColor = { color: Color; opacity: number };

/**
 * Turns CSS colors — including `var(--color-primary)`, `oklch(...)`, and `color-mix(...)` — into
 * three.js colors, as the browser resolves them for `probe`.  three.js parses neither custom
 * properties nor CSS Color 4 spaces, so each is painted onto a 1×1 canvas and read back as sRGB.
 */
export class ColorResolver {
  #probe: HTMLElement;
  #context: CanvasRenderingContext2D | null = null;
  #cache = new Map<string, ResolvedColor>();

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
    return changed;
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
