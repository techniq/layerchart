import type { GeoProjection } from 'd3-geo';
import type { GeoContextProps } from '$lib/components/GeoContext.svelte';

export class GeoState {
  // Props getter function - set in constructor
  private _propsGetter!: () => GeoContextProps;

  // Props - accessed via getter function for fine-grained reactivity
  props = $derived(this._propsGetter());

  // Context references
  chartWidth = $state(100);
  chartHeight = $state(100);
  transformScale = $state(1);
  transformTranslateX = $state(0);
  transformTranslateY = $state(0);

  // The actual projection instance
  projection = $state<GeoProjection | undefined>(undefined);

  constructor(propsGetter: () => GeoContextProps) {
    this._propsGetter = propsGetter;

    // Main effect to build and configure the projection
    $effect.pre(() => {
      if (!this.props.projection) return;

      const _projection = this.props.projection();

      // Apply fitSize if fitGeojson is provided
      if (this.props.fitGeojson && 'fitSize' in _projection) {
        _projection.fitSize(this.fitSizeRange, this.props.fitGeojson);
      }

      // Apply scale
      if ('scale' in _projection) {
        if (this.props.scale) {
          _projection.scale(this.props.scale);
        }

        if (this.props.applyTransform?.includes('scale')) {
          _projection.scale(this.transformScale);
        }
      }

      // Apply rotate
      if ('rotate' in _projection) {
        if (this.props.rotate) {
          _projection.rotate([
            this.props.rotate.yaw,
            this.props.rotate.pitch,
            this.props.rotate.roll,
          ]);
        }

        if (this.props.applyTransform?.includes('rotate')) {
          _projection.rotate([
            this.transformTranslateX, // yaw
            this.transformTranslateY, // pitch
            // TODO: `roll` from `transformContext`?
          ]);
        }
      }

      // Apply translate
      if ('translate' in _projection) {
        if (this.props.translate) {
          _projection.translate(this.props.translate);
        }

        if (this.props.applyTransform?.includes('translate')) {
          _projection.translate([this.transformTranslateX, this.transformTranslateY]);
        }
      }

      // Apply center
      if (this.props.center && 'center' in _projection) {
        _projection.center(this.props.center);
      }

      // Apply reflectX
      if (this.props.reflectX) {
        _projection.reflectX(this.props.reflectX);
      }

      // Apply reflectY
      if (this.props.reflectY) {
        _projection.reflectY(this.props.reflectY);
      }

      // Apply clipAngle
      if (this.props.clipAngle && 'clipAngle' in _projection) {
        _projection.clipAngle(this.props.clipAngle);
      }

      // Apply clipExtent
      if (this.props.clipExtent && 'clipExtent' in _projection) {
        _projection.clipExtent(this.props.clipExtent);
      }

      this.projection = _projection;
    });
  }

  // Derived properties
  fitSizeRange = $derived(
    this.props.fixedAspectRatio
      ? [100, 100 / this.props.fixedAspectRatio]
      : [this.chartWidth, this.chartHeight]
  ) as [number, number];
}
