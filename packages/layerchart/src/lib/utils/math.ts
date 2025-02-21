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
    x: Math.cos(angle) * radius,
    y: Math.sin(angle) * radius,
  };
}

/**
 * Convert cartesian to polar coordinate system.  Angle in radians with 0 at the 12 o'clock position
 */
export function cartesianToPolar(x: number, y: number) {
  let radians = Math.atan2(y, x);

  radians += Math.PI / 2; // shift 90 degrees to align 0deg at 12 o'clock

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

/** Parse percent string (`50%`) to decimal (`0.5`) */
export function parsePercent(percent: string | number) {
  if (typeof percent === 'number') {
    // Assume already decimal
    return percent;
  } else {
    return Number(percent.replace('%', '')) / 100;
  }
}

/** Add second value while maintaining `Date` or `number` type */
export function add(value1: Date | number, value2: number) {
  if (value1 instanceof Date) {
    return new Date(value1.getTime() + value2);
  } else {
    return value1 + value2;
  }
}
