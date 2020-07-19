import { CumulativePercentage, Point, CirclularSegmentInfo } from './types'

export const pi = Math.PI
export const sin = Math.sin
export const cos = Math.cos
export const pow = Math.pow
export const sqrt = Math.sqrt

/**
 * Given a percentage [0, 1] of the circle area and the circle radius, it returns the height of the
 * circular segment and the angle (is radians) subtended by the chord at the centre of the circle.
 * @param percentage numbers between 0 and 1 that are the percentages of area to be represented
 * @param r circle radius
 * @param iterations Newton's method number of iterations
 */
export function circularSegmentHeight(
  percentage: number,
  r: number,
  iterations = 1000
): { height: number; theta: number } {
  let theta0
  let theta1
  // safe initial starting point for Newton's method (don't remember why)
  theta1 = pow(12 * percentage * pi, 1 / 3)

  for (let i = 0; i < iterations; ++i) {
    theta0 = theta1
    theta1 = (sin(theta0) - theta0 * cos(theta0) + 2 * pi * percentage) / (1 - cos(theta0))
    theta1 = isNaN(theta1) ? 0 : theta1
  }
  percentage = (1 - cos(theta1 / 2)) / 2

  const height = 2 * r * percentage // height of circular segment

  return {
    height,
    theta: theta1,
  }
}

/**
 * Given an array of numbers, it returns an array of objects containing the
 * original values and the cumulative values.
 * @param percentages numbers between 0 and 1 that are the percentages of area to be represented
 */
export function computeCumulativeNumbers(percentages: number[]): CumulativePercentage[] {
  const cumulativePercentages = percentages.reduce((prevWithCumPercentages, percentage, i) => {
    const cumulativePart = i === 0 ? 0 : prevWithCumPercentages[i - 1].cumulativePercentage
    const newDatum = {
      percentage: percentage,
      cumulativePercentage: percentage + cumulativePart,
    } as CumulativePercentage
    prevWithCumPercentages.push(newDatum)
    return prevWithCumPercentages
  }, []) as CumulativePercentage[]
  return cumulativePercentages
}

/**
 * Given the circle radius, the circle center and some informations about circular segments,
 * it computes and returns more info about those circular segments like paths and centers.
 * @param segmentsInfo some info about circular segments.
 * @param r circle radius
 * @param center circle center
 */
export function computeCircularSegmentPathStrings(
  segmentsInfo: CirclularSegmentInfo[],
  r: number,
  center: Point
): CirclularSegmentInfo[] {
  const { x: cx, y: cy } = center

  const segmentsInfoWithPath = segmentsInfo.map((segmentInfo, i) => {
    const { percentage, height, theta } = segmentInfo
    const hTop = i === 0 ? 0 : segmentsInfo[i - 1].height
    const hBottom = height
    const sweepFlag = 0
    const largeArcFlag = 0

    const xLeftTop = cx + sqrt(hTop * (2 * r - hTop))
    const xRightTop = cx - sqrt(hTop * (2 * r - hTop))
    const xLeftBottom = cx + sqrt(hBottom * (2 * r - hBottom))
    const xRightBottom = cx - sqrt(hBottom * (2 * r - hBottom))

    const circlularSegmentCenter = { x: cx, y: hTop + (hBottom - hTop) / 2 }

    const path = `M ${xLeftTop} ${hTop}
        L ${xRightTop} ${hTop}
        A ${r} ${r} ${theta} ${largeArcFlag} ${sweepFlag} ${xRightBottom} ${hBottom}
        L ${xLeftBottom} ${hBottom}
        A ${r} ${r} ${theta} ${largeArcFlag} ${sweepFlag} ${xLeftTop} ${hTop}`

    return { percentage, theta, path, circlularSegmentCenter }
  })

  return segmentsInfoWithPath
}
