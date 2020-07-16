export const pi = Math.PI
export const sin = Math.sin
export const cos = Math.cos
export const pow = Math.pow
export const sqrt = Math.sqrt

export function toRad(deg: number) {
  return deg * (Math.PI / 180)
}

export function toDeg(rad: number) {
  return rad * (180 / Math.PI)
}

export function circularSegmentHeight(F: number, Fcum: number, r: number, iterations = 1000) {
  let theta0
  let theta1
  theta1 = pow(12 * Fcum * pi, 1 / 3) // don't know why
  for (let i = 0; i < iterations; ++i) {
    theta0 = theta1
    theta1 = (sin(theta0) - theta0 * cos(theta0) + 2 * pi * Fcum) / (1 - cos(theta0))
    theta1 = isNaN(theta1) ? 0 : theta1
  }
  Fcum = (1 - cos(theta1 / 2)) / 2
  const h = 2 * r * Fcum // height of circular segment with area F
  const m = r - h
  return { F2cum: Fcum, h, m, theta: theta1, thetaDeg: toDeg(theta1) }
}
