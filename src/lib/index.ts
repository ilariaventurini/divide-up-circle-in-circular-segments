import { Percentage, Point, CirclularSegmentInfo } from './types'
import { computeCumulativePercentages, computeInfo } from './math-utils'
import { sumBy } from 'lodash'

/**
 * Given the radius and the center of the circle and an array of objects containing a percentage propery,
 * it returns an array of objects containing:
 * - the original object
 * - the angle subtended by the chord at the centre of the circle related to the circlular segment
 * - the path to draw the circular segment
 * - the center point of the circular segment.
 * @param radius circle radius
 * @param center circle center point
 * @param dataset array of objects, each object must contains a percentage property (a number in [0, 1])
 */
export function computeCircularSegments<T extends Percentage>(
  radius: number,
  center: Point,
  dataset: T[]
): Array<CirclularSegmentInfo<T>> {
  if (!dataset.length) {
    throw new Error(`The dataset must contain at least one element.`)
  }
  const percentageSum = sumBy(dataset, 'percentage')
  if (percentageSum !== 1) {
    throw new Error(`The sum of 'percentage' values must be 1. Your sum is ${percentageSum}.`)
  }

  const cumulativePercentages = computeCumulativePercentages(dataset)

  return computeInfo(radius, center, cumulativePercentages)
}
