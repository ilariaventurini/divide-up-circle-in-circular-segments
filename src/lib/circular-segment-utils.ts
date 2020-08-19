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
 * @param options options object
 */
export function computeHeightsAndAngle<T extends Percentage>(
  radius: number,
  center: Point,
  cumulativePercentages: Array<CumulativePercentage<T>>,
  defaultedOptions: Options
): Array<CirclularSegmentInfo<T>> {
  // compute cumulative height and angle
  const segmentsWithCumulativeHeightAndAngle = cumulativePercentages.map((datum) => {
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
  return computeCircularSegmentsInfo(segmentsWithHeightsAndAngle, radius, center, defaultedOptions)
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
 * Given the circle radius, the circle center and some information about circular segments (height and angle),
 * it computes and returns more info about those circular segments like:
 * - the original object
 * - the angle subtended by the chord at the centre of the circle related to the circlular segment
 * - the path to draw the circular segment
 * - the center point of the circular segment..
 * @param segmentsInfo some info about circular segments.
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
  const { x: cx, y: cy } = center

  const segmentsInfoWithPath = segmentsInfo.map((segmentInfo, i) => {
    const { cumulativeHeight, height, theta } = segmentInfo
    const hTop = i === 0 ? 0 : segmentsInfo[i - 1].cumulativeHeight
    const hBottom = cumulativeHeight

    // horizontal vertices
    const xTopLeft = cx - sqrt(hTop * (2 * radius - hTop))
    const xTopRight = cx + sqrt(hTop * (2 * radius - hTop))
    const xBottomLeft = cx - sqrt(hBottom * (2 * radius - hBottom))
    const xBottomRight = cx + sqrt(hBottom * (2 * radius - hBottom))
    const yTop = cy - radius + cumulativeHeight - height
    const yBottom = yTop + height

    const verticesHor: Vertices = {
      topLeft: { x: xTopLeft, y: yTop },
      topRight: { x: xTopRight, y: yTop },
      bottomLeft: { x: xBottomLeft, y: yBottom },
      bottomRight: { x: xBottomRight, y: yBottom },
    }
    // rotate vertices if necessary
    const vertices = computeVertices(verticesHor, { x: cx, y: cy }, options)

    const circlularSegmentCenter =
      options.orientation === 'horizontal'
        ? { x: cx, y: yTop + height / 2 }
        : { x: yTop + height / 2, y: cy }
    const path = computePath(vertices, radius, theta, options)

    return {
      ...segmentInfo,
      path,
      center: circlularSegmentCenter,
      vertices,
    } as CirclularSegmentInfo<T>
  })

  return segmentsInfoWithPath
}

function computeVertices(vertices: Vertices, rotationPoint: Point, options: Options): Vertices {
  if (options.orientation === 'horizontal') {
    return vertices
  } else {
    const angle = 90
    const { topLeft, topRight, bottomLeft, bottomRight } = vertices
    const rTL = rotate(topLeft, rotationPoint, angle)
    const rTR = rotate(topRight, rotationPoint, angle)
    const rBL = rotate(bottomLeft, rotationPoint, angle)
    const rBR = rotate(bottomRight, rotationPoint, angle)
    return {
      topLeft: { ...rBL },
      topRight: { ...rTL },
      bottomLeft: { ...rBR },
      bottomRight: { ...rTR },
    }
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
