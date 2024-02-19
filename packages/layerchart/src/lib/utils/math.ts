/**
 * Convert degrees to radians
 */
export function degreesToRadians(degrees: number) {
  return (degrees * Math.PI) / 180;
}

/**
 * Convert radians to degrees
 */
export function radiansToDegrees(radians: number) {
  return radians * (180 / Math.PI);
}

/**
 * Convert polar to cartesian coordinate system.
 * see also: https://d3js.org/d3-shape/symbol#pointRadial
 * @param angle - Angle in radians
 * @param radius - Radius
 */
export function polarToCartesian(angle: number, radius: number) {
  return {
    x: radius * Math.cos(angle),
    y: radius * Math.sin(angle),
  };
}

/**
 * Convert cartesian to polar coordinate system.  Angle in radians
 */
export function cartesianToPolar(x: number, y: number) {
  return {
    radius: Math.sqrt(x ** 2 + y ** 2),
    angle: Math.atan(y / x),
  };
}

/** Convert celsius temperature to fahrenheit */
export function celsiusToFahrenheit(temperature: number) {
  return temperature * (9 / 5) + 32;
}

/** Convert fahrenheit temperature to celsius */
export function fahrenheitToCelsius(temperature: number) {
  return (temperature - 32) * (5 / 9);
}
