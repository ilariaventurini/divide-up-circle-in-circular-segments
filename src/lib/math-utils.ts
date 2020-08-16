import { CumulativePercentage, Point, CirclularSegmentInfo, Percentage } from './types'

/**
 * Given an array of objects containing the property `percentage` (number in [0, 1]),
 * it returns an array of objects containing the original values and the cumulative percentage value.
 * @param dataset array of objects containing a property `percentage` (number in [0, 1]) that is the percentage of area to be represented
 */
export function computeCumulativePercentages<T extends Percentage>(
  dataset: T[]
): Array<CumulativePercentage<T>> {
  return dataset.reduce((prevWithCumPercentages, datum, i) => {
    const cumulativePart = i === 0 ? 0 : prevWithCumPercentages[i - 1].cumulativePercentage
    const newDatum = {
      ...datum,
      cumulativePercentage: datum.percentage + cumulativePart,
    }
    prevWithCumPercentages.push(newDatum)
    return prevWithCumPercentages
  }, []) as Array<CumulativePercentage<T>>
}

/**
 * Given the circle radius, the circle center and an array of objects,
 * it returns some useful information to draw the circular segments, like:
 * - the original object
 * - the angle subtended by the chord at the centre of the circle related to the circlular segment
 * - the path to draw the circular segment
 * - the center point of the circular segment.
 * @param radius circle radius
 * @param center circle center
 * @param cumulativePercentages array of objects containing the original values and the cumulative percentage value
 */
export function computeInfo<T extends Percentage>(
  radius: number,
  center: Point,
  cumulativePercentages: Array<CumulativePercentage<T>>
): Array<CirclularSegmentInfo<T>> {
  const segmentsWithHeightAndAngle = cumulativePercentages.map((datum) => ({
    ...datum,
    ...circularSegmentHeight(datum.cumulativePercentage, radius),
  })) as Array<Omit<CirclularSegmentInfo<T>, 'path' | 'circlularSegmentCenter'>>

  // compute the circular segment path strings
  return computeCircularSegmentPathStrings(segmentsWithHeightAndAngle, radius, center)
}

/**
 * Given a percentage [0, 1] of the circle area and the circle radius, it returns the height of the
 * circular segment and the angle (radians) subtended by the chord at the circle center.
 * @param percentage numbers between 0 and 1 that are the percentages of area to be represented
 * @param radius circle radius
 * @param iterations Newton's method number of iterations
 */
export function circularSegmentHeight(
  percentage: number,
  radius: number,
  iterations = 1000
): { height: number; theta: number } {
  const { PI, sin, cos, pow } = Math

  let theta0
  let theta1
  // safe initial starting point for Newton's method (don't remember why)
  theta1 = pow(12 * percentage * PI, 1 / 3)

  for (let i = 0; i < iterations; ++i) {
    theta0 = theta1
    theta1 = (sin(theta0) - theta0 * cos(theta0) + 2 * PI * percentage) / (1 - cos(theta0))
    theta1 = isNaN(theta1) ? 0 : theta1
  }
  percentage = (1 - cos(theta1 / 2)) / 2

  const height = 2 * radius * percentage // height of circular segment

  return {
    height,
    theta: theta1,
  }
}

/**
 * Given the circle radius, the circle center and some information about circular segments (height and angle),
 * it computes and returns more info about those circular segments like:
 * - the original object
 * - the angle subtended by the chord at the centre of the circle related to the circlular segment
 * - the path to draw the circular segment
 * - the center point of the circular segment..
 * @param segmentsInfo some info about circular segments.
 * @param radius circle radius
 * @param center circle center
 */
export function computeCircularSegmentPathStrings<T extends Percentage>(
  segmentsInfo: Array<Omit<CirclularSegmentInfo<T>, 'path' | 'circlularSegmentCenter'>>,
  radius: number,
  center: Point
): Array<CirclularSegmentInfo<T>> {
  const { x: cx, y: cy } = center
  const { sqrt } = Math

  const segmentsInfoWithPath = segmentsInfo.map((segmentInfo, i) => {
    const { height, theta } = segmentInfo
    const hTop = i === 0 ? 0 : segmentsInfo[i - 1].height
    const hBottom = height
    const sweepFlag = 0
    const largeArcFlag = 0

    const xLeftTop = cx + sqrt(hTop * (2 * radius - hTop))
    const xRightTop = cx - sqrt(hTop * (2 * radius - hTop))
    const xLeftBottom = cx + sqrt(hBottom * (2 * radius - hBottom))
    const xRightBottom = cx - sqrt(hBottom * (2 * radius - hBottom))

    const circlularSegmentCenter = { x: cx, y: hTop + (hBottom - hTop) / 2 }

    const path = `M ${xLeftTop} ${hTop}
        L ${xRightTop} ${hTop}
        A ${radius} ${radius} ${theta} ${largeArcFlag} ${sweepFlag} ${xRightBottom} ${hBottom}
        L ${xLeftBottom} ${hBottom}
        A ${radius} ${radius} ${theta} ${largeArcFlag} ${sweepFlag} ${xLeftTop} ${hTop}`

    return { ...segmentInfo, path, circlularSegmentCenter } as CirclularSegmentInfo<T>
  })

  return segmentsInfoWithPath
}
