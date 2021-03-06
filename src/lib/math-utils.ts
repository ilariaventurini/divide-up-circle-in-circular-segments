import { Point } from './types'

/**
 *                        * new point
 *                   .     -
 *              .           -
 *         .  angle          -
 *    *........................*
 *  center                    point
 *
 * Rotates the point `point` by angle `angle` with rotation point `center`.
 * @param point point to rotate
 * @param center rotation point
 * @param angle angle in degree
 */
export function rotate(point: Point, center: Point, angle: number): Point {
  const radians = degToRad(angle)
  const cos = Math.cos(radians)
  const sin = Math.sin(radians)
  const nx = cos * (point.x - center.x) + sin * (point.y - center.y) + center.x
  const ny = cos * (point.y - center.y) - sin * (point.x - center.x) + center.y
  return { x: nx, y: ny }
}

/**
 * Converts degree to radians.
 * @param deg angle in degree
 */
export function degToRad(deg: number): number {
  return (Math.PI / 180) * deg
}

/**
 * Converts radians to degree.
 * @param deg angle in radians
 */
export function radToDeg(rad: number): number {
  return (180 / Math.PI) * rad
}
