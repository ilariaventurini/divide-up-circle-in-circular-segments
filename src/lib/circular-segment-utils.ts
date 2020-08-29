import {
  CumulativePercentage,
  Point,
  CirclularSegmentInfo,
  Percentage,
  Options,
  Vertices,
} from './types'
import { rotate } from './math-utils'

const { PI, sin, cos, pow, sqrt } = Math

/**
 * Given an array of objects containing the property `percentage` (number in [0, 1]),
 * it returns an array of objects containing the original values and the cumulative percentage value.
 * @param dataset array of objects containing a property `percentage` (number in [0, 1]) that is the percentage of area to be represented
 */
export function computeCumulativePercentages<T extends Percentage>(
  dataset: T[]
): Array<CumulativePercentage<T>> {
  return dataset.reduce((prevWithCumPercentages, datum, i) => {
    const cumulativeParcentage = i === 0 ? 0 : prevWithCumPercentages[i - 1].cumulativePercentage
    const newDatum = {
      ...datum,
      cumulativePercentage: datum.percentage + cumulativeParcentage,
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
 * @param dataset array of objects containing the original values and the cumulative percentage values
 * @param options options object
 */
export function computeHeightsAndAngle<T extends Percentage>(
  radius: number,
  center: Point,
  dataset: Array<CumulativePercentage<T>>,
  options: Options
): Array<CirclularSegmentInfo<T>> {
  // compute cumulative height and angle
  const segmentsWithCumulativeHeightAndAngle = dataset.map((datum) => {
    const { height, theta } = circularSegmentHeightAndAngle(datum.cumulativePercentage, radius)
    return {
      ...datum,
      theta,
      cumulativeHeight: height,
    }
  }) as Array<Omit<CirclularSegmentInfo<T>, 'path' | 'center'>>

  // compute circular segment real height
  const segmentsWithHeightsAndAngle = segmentsWithCumulativeHeightAndAngle.map((d, i) => {
    const { cumulativeHeight } = d
    const prevH = i === 0 ? 0 : segmentsWithCumulativeHeightAndAngle[i - 1].cumulativeHeight
    const height = cumulativeHeight - prevH
    return { ...d, height }
  })

  // compute the circular segment info
  return computeCircularSegmentsInfo(segmentsWithHeightsAndAngle, radius, center, options)
}

/**
 * Given a percentage [0, 1] of the circle area and the circle radius, it returns the height of the
 * circular segment and the angle (radians) subtended by the chord at the circle center.
 * @param percentage numbers between 0 and 1 that are the percentages of area to be represented
 * @param radius circle radius
 * @param iterations Newton's method number of iterations
 */
export function circularSegmentHeightAndAngle(
  percentage: number,
  radius: number,
  iterations = 20
): {
  height: number
  theta: number
} {
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
 * Given the circle radius, the circle center and some information about circular segments (height, cumulative height and angle),
 * it computes and returns more info about those circular segments like:
 * - the path string useful to draw the circular segment
 * - the center point of the circular segment
 * - coordinates of vertices of circular segment.
 * @param segmentsInfo some info about circular segments
 * @param radius circle radius
 * @param center circle center
 * @param options options object
 */
export function computeCircularSegmentsInfo<T extends Percentage>(
  segmentsInfo: Array<Omit<CirclularSegmentInfo<T>, 'path' | 'center'>>,
  radius: number,
  center: Point,
  options: Options
): Array<CirclularSegmentInfo<T>> {
  return segmentsInfo.map((segmentInfo) => {
    const vertices = computeVertices(segmentInfo, radius, center, options)
    const circularSegmentCenter = computeCenter(segmentInfo, radius, center, options)
    const path = computePath(vertices, radius, segmentInfo.theta, options)

    return {
      ...segmentInfo,
      path,
      center: circularSegmentCenter,
      vertices,
    } as CirclularSegmentInfo<T>
  })
}

function computeVertices<T extends Percentage>(
  segmentInfo: Omit<CirclularSegmentInfo<T>, 'path' | 'center'>,
  radius: number,
  center: Point,
  options: Options
): Vertices {
  // compute vertices for horizontal orientation
  const { x: cx, y: cy } = center
  const { cumulativeHeight, height } = segmentInfo

  const yTop = cy - radius + cumulativeHeight - height
  const yBottom = yTop + height
  const xTopLeft = cx - sqrt(yTop * (2 * radius - yTop))
  const xTopRight = cx + sqrt(yTop * (2 * radius - yTop))
  const xBottomLeft = cx - sqrt(yBottom * (2 * radius - yBottom))
  const xBottomRight = cx + sqrt(yBottom * (2 * radius - yBottom))

  const vertices: Vertices = {
    topLeft: { x: xTopLeft, y: yTop },
    topRight: { x: xTopRight, y: yTop },
    bottomLeft: { x: xBottomLeft, y: yBottom },
    bottomRight: { x: xBottomRight, y: yBottom },
  }

  if (options.orientation === 'horizontal') {
    return vertices
  } else {
    // if orientation is vertical, rotate points by 90°
    const angle = 90
    const { topLeft, topRight, bottomLeft, bottomRight } = vertices
    const rTL = rotate(topLeft, center, angle)
    const rTR = rotate(topRight, center, angle)
    const rBL = rotate(bottomLeft, center, angle)
    const rBR = rotate(bottomRight, center, angle)
    return {
      topLeft: { ...rBL },
      topRight: { ...rTL },
      bottomLeft: { ...rBR },
      bottomRight: { ...rTR },
    }
  }
}

function computeCenter<T extends Percentage>(
  segmentInfo: Omit<CirclularSegmentInfo<T>, 'path' | 'center'>,
  radius: number,
  center: Point,
  options: Options
): Point {
  const { x: cx, y: cy } = center
  const { cumulativeHeight, height } = segmentInfo
  const yTop = cy - radius + cumulativeHeight - height

  if (options.orientation === 'horizontal') {
    return { x: cx, y: yTop + height / 2 }
  } else {
    return { x: yTop + height / 2, y: cy }
  }
}

function computePath(vertices: Vertices, radius: number, theta: number, options: Options): string {
  if (options.orientation === 'horizontal') {
    const sweepFlag = 0
    const largeArcFlag = 0

    return `M ${vertices.topLeft.x} ${vertices.topLeft.y}
        L ${vertices.topLeft.x} ${vertices.topLeft.y}
        A ${radius} ${radius} ${theta} ${largeArcFlag} ${sweepFlag} ${vertices.bottomLeft.x} ${vertices.bottomLeft.y}
        L ${vertices.bottomRight.x} ${vertices.bottomRight.y}
        A ${radius} ${radius} ${theta} ${largeArcFlag} ${sweepFlag} ${vertices.topRight.x} ${vertices.topRight.y}`
  } else {
    const sweepFlag = 1
    const largeArcFlag = 0

    return `M ${vertices.topLeft.x} ${vertices.topLeft.y}
        A ${radius} ${radius} ${theta} ${largeArcFlag} ${sweepFlag} ${vertices.topRight.x} ${vertices.topRight.y}
        L ${vertices.bottomRight.x} ${vertices.bottomRight.y}
        A ${radius} ${radius} ${theta} ${largeArcFlag} ${sweepFlag} ${vertices.bottomLeft.x} ${vertices.bottomLeft.y}
        L ${vertices.topLeft.x} ${vertices.topLeft.y}`
  }
}
