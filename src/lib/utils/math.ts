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
