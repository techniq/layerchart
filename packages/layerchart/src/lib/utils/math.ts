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
 * Convert cartesian to polar coordinate system.  Angle in radians with 0 at the 12 o'clock position
 */
export function cartesianToPolar(x: number, y: number) {
  let radians = Math.atan2(y, x);

  radians += Math.PI / 2;

  // Ensure the result is between 0 and 2π
  if (radians < 0) {
    radians += 2 * Math.PI;
  }

  return {
    radius: Math.sqrt(x ** 2 + y ** 2),
    radians,
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
