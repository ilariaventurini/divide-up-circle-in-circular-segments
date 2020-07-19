import { Percentage, Point, CirclularSegmentInfo } from './types'
import {
  circularSegmentHeight,
  computeCumulativeNumbers,
  computeCircularSegmentPathStrings,
} from './math-utils'
import { sum } from 'lodash'

/**
 * Given the radius and the center of the circle and an array of percentages, it returns an array of objects containing:
 * - the original percentage value
 * - the angle subtended by the chord at the centre of the circle related to the circlular segment
 * - the path to draw the circular segment
 * - the center point of the circular segment.
 * @param r circle radius
 * @param center circle center point
 * @param percentanges array of percentages (each percentage should be in [0, 1])
 */
export function computeCircularSegmentsInfo(
  r: number,
  center: Point,
  percentages: Percentage[]
): CirclularSegmentInfo[] {
  if (!percentages.length) {
    throw new Error(
      `The 'percentages' array must contain at least one element and the sum of the percentages values must be 1.`
    )
  }
  if (sum(percentages) !== 1) {
    throw new Error(`The sum of 'percentages' values must be 1. Your sum is ${sum(percentages)}.`)
  }

  // create cumulative previuous percentages
  const cumulativePercentages = computeCumulativeNumbers(percentages)

  // compute segments heights and angles
  const segmentsInfo = cumulativePercentages.map(({ percentage, cumulativePercentage }) => ({
    percentage,
    cumulativePercentage,
    ...circularSegmentHeight(cumulativePercentage, r),
  })) as CirclularSegmentInfo[]

  // compute the circular segment path strings
  return computeCircularSegmentPathStrings(segmentsInfo, r, center)
}
