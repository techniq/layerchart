import {
  GreaterEqualStencilFunc,
  KeepStencilOp,
  ReplaceStencilOp,
  type Material,
  type Object3D,
} from 'three';

/**
 * Layer `object` by `rank` (1 to 255) rather than by depth, among others layered so: where they
 * overlap on screen the highest rank shows, however far in front of it a lower one is.  Each is
 * drawn highest first, only where none higher has been, marking the stencil with its rank, so a
 * lower one fills just what higher ones leave.  `last`, it's drawn after them all, over them (ex.
 * fading in over them).  Needs a renderer with a stencil buffer.
 */
export function rankLayer(object: Object3D & { material: Material }, rank: number, last = false) {
  const material = object.material;
  material.stencilWrite = true;
  material.stencilRef = rank;
  material.stencilFunc = GreaterEqualStencilFunc;
  material.stencilZPass = ReplaceStencilOp;
  material.stencilFail = material.stencilZFail = KeepStencilOp;
  object.renderOrder = last ? 1 : -rank;
}
