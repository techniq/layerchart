import { isSVGElement, isSVGGraphicsElement, isSVGSVGElement, isTouchEvent } from 'svelte-ux';

// See: https://github.com/airbnb/visx/blob/master/packages/visx-event/src/localPointGeneric.ts
// TODO: Matches event.layerX/Y, but are deprecated (https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/layerX).
//       Similar and could be replaced by event.offsetX/Y (but not identical)
export function localPoint(node: Element, event: MouseEvent | TouchEvent) {
  if (!node || !event) return null;

  const coords = getPointFromEvent(event);

  // find top-most SVG
  const svg = isSVGElement(node) ? node.ownerSVGElement : node;
  const screenCTM = isSVGGraphicsElement(svg) ? svg.getScreenCTM() : null;

  if (isSVGSVGElement(svg) && screenCTM) {
    let point = svg.createSVGPoint();
    point.x = coords.x;
    point.y = coords.y;
    point = point.matrixTransform(screenCTM.inverse());

    return {
      x: point.x,
      y: point.y
    };
  }

  // fall back to bounding box
  const rect = node.getBoundingClientRect();

  return {
    x: coords.x - rect.left - node.clientLeft,
    y: coords.y - rect.top - node.clientTop
  };
}

function getPointFromEvent(event?: MouseEvent | TouchEvent) {
  if (!event) return { x: 0, y: 0 };

  if (isTouchEvent(event)) {
    return event.changedTouches.length > 0
      ? {
          x: event.changedTouches[0].clientX,
          y: event.changedTouches[0].clientY
        }
      : { x: 0, y: 0 };
  }

  return {
    x: event.clientX,
    y: event.clientY
  };
}
