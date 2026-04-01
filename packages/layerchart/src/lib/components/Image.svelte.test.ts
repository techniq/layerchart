import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from 'vitest/browser';

import TestHarness, { componentTestId } from './tests/TestHarness.svelte';
import Image from './Image.svelte';

describe('Image', () => {
  describe('pixel mode', () => {
    it('should render an image with pixel values', async () => {
      render(TestHarness, {
        component: Image,
        componentProps: {
          href: 'https://example.com/image.png',
          x: 50,
          y: 50,
          width: 32,
          height: 32,
        },
      });

      const el = page.getByTestId(componentTestId);
      await expect.element(el).toBeInTheDocument();
      expect(el.element()?.getAttribute('href')).toBe('https://example.com/image.png');
      // Image is centered: x - width/2 = 50 - 16 = 34
      expect(el.element()?.getAttribute('x')).toBe('34');
      expect(el.element()?.getAttribute('y')).toBe('34');
      expect(el.element()?.getAttribute('width')).toBe('32');
      expect(el.element()?.getAttribute('height')).toBe('32');
    });

    it('should default width and height to 16', async () => {
      render(TestHarness, {
        component: Image,
        componentProps: {
          href: 'https://example.com/image.png',
          x: 100,
          y: 100,
        },
      });

      const el = page.getByTestId(componentTestId);
      await expect.element(el).toBeInTheDocument();
      expect(el.element()?.getAttribute('width')).toBe('16');
      expect(el.element()?.getAttribute('height')).toBe('16');
    });

    it('should apply preserveAspectRatio', async () => {
      render(TestHarness, {
        component: Image,
        componentProps: {
          href: 'https://example.com/image.png',
          x: 50,
          y: 50,
          preserveAspectRatio: 'xMidYMid slice',
        },
      });

      const el = page.getByTestId(componentTestId);
      await expect.element(el).toBeInTheDocument();
      expect(el.element()?.getAttribute('preserveAspectRatio')).toBe('xMidYMid slice');
    });

    it('should apply circular clipping when r is set', async () => {
      render(TestHarness, {
        component: Image,
        componentProps: {
          href: 'https://example.com/image.png',
          x: 50,
          y: 50,
          r: 20,
        },
      });

      const el = page.getByTestId(componentTestId);
      await expect.element(el).toBeInTheDocument();
      // When r=20, width/height default to 2*r = 40
      expect(el.element()?.getAttribute('width')).toBe('40');
      expect(el.element()?.getAttribute('height')).toBe('40');
      // Should have a clip-path attribute
      expect(el.element()?.getAttribute('clip-path')).toMatch(/^url\(#image-clip-/);
    });

    it('should apply rotation', async () => {
      render(TestHarness, {
        component: Image,
        componentProps: {
          href: 'https://example.com/image.png',
          x: 50,
          y: 50,
          rotate: 45,
        },
      });

      const el = page.getByTestId(componentTestId);
      await expect.element(el).toBeInTheDocument();
      expect(el.element()?.getAttribute('transform')).toBe('rotate(45, 50, 50)');
    });
  });

  describe('data mode', () => {
    const data = [
      { date: new Date('2024-01-01'), value: 20, imageUrl: 'https://example.com/a.png' },
      { date: new Date('2024-02-01'), value: 40, imageUrl: 'https://example.com/b.png' },
      { date: new Date('2024-03-01'), value: 60, imageUrl: 'https://example.com/c.png' },
    ];

    it('should render one image per data item with string accessors', async () => {
      render(TestHarness, {
        component: Image,
        chartProps: {
          data,
          x: 'date',
          y: 'value',
          yDomain: [0, 100],
        },
        componentProps: {
          href: 'imageUrl',
          x: 'date',
          y: 'value',
        },
      });

      const images = page.getByTestId(componentTestId).elements();
      await expect.poll(() => images.length).toBe(3);
    });

    it('should render with function accessors', async () => {
      render(TestHarness, {
        component: Image,
        chartProps: {
          data,
          x: 'date',
          y: 'value',
          yDomain: [0, 100],
        },
        componentProps: {
          href: (d: any) => d.imageUrl,
          x: (d: any) => d.date,
          y: (d: any) => d.value,
        },
      });

      const images = page.getByTestId(componentTestId).elements();
      await expect.poll(() => images.length).toBe(3);
    });

    it('should resolve data-driven href from data property', async () => {
      render(TestHarness, {
        component: Image,
        chartProps: {
          data,
          x: 'date',
          y: 'value',
          yDomain: [0, 100],
        },
        componentProps: {
          href: 'imageUrl',
          x: 'date',
          y: 'value',
        },
      });

      const images = page.getByTestId(componentTestId).elements();
      await expect.poll(() => images.length).toBe(3);

      expect(images[0].getAttribute('href')).toBe('https://example.com/a.png');
      expect(images[1].getAttribute('href')).toBe('https://example.com/b.png');
      expect(images[2].getAttribute('href')).toBe('https://example.com/c.png');
    });

    it('should pass literal URL through unchanged in data mode', async () => {
      render(TestHarness, {
        component: Image,
        chartProps: {
          data,
          x: 'date',
          y: 'value',
          yDomain: [0, 100],
        },
        componentProps: {
          href: 'https://example.com/constant.png',
          x: 'date',
          y: 'value',
        },
      });

      const images = page.getByTestId(componentTestId).elements();
      await expect.poll(() => images.length).toBe(3);

      // All images should have the same constant URL
      expect(images[0].getAttribute('href')).toBe('https://example.com/constant.png');
      expect(images[1].getAttribute('href')).toBe('https://example.com/constant.png');
    });

    it('should use explicit data prop over chart context data', async () => {
      const explicitData = [
        { date: new Date('2024-01-01'), value: 20, imageUrl: 'https://example.com/a.png' },
      ];

      render(TestHarness, {
        component: Image,
        chartProps: {
          data,
          x: 'date',
          y: 'value',
          yDomain: [0, 100],
        },
        componentProps: {
          data: explicitData,
          href: 'imageUrl',
          x: 'date',
          y: 'value',
        },
      });

      const images = page.getByTestId(componentTestId).elements();
      await expect.poll(() => images.length).toBe(1);
    });

    it('should apply circular clipping in data mode', async () => {
      render(TestHarness, {
        component: Image,
        chartProps: {
          data,
          x: 'date',
          y: 'value',
          yDomain: [0, 100],
        },
        componentProps: {
          href: 'imageUrl',
          x: 'date',
          y: 'value',
          r: 15,
        },
      });

      const images = page.getByTestId(componentTestId).elements();
      await expect.poll(() => images.length).toBe(3);

      // Each image should have a clip-path
      expect(images[0].getAttribute('clip-path')).toMatch(/^url\(#image-clip-/);
      // Width/height should default to 2*r = 30
      expect(images[0].getAttribute('width')).toBe('30');
      expect(images[0].getAttribute('height')).toBe('30');
    });
  });
});
