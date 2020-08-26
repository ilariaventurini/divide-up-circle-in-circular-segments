import { sumBy } from 'lodash'
import { Percentage, Point, CirclularSegmentInfo, Options } from './types'
import { computeCumulativePercentages, computeHeightsAndAngle } from './circular-segment-utils'

const defaultOptions: Options = {
  orientation: 'horizontal',
}

/**
 * Given the radius and the center of the circle and an array of objects containing a percentage property (number in [0, 1]),
 * returns an array of objects in which each object contains the following information about each circular segment:
 * - the original object
 * - the angle subtended by the chord at the center of the circle related to the circlular segment
 * - the path string useful to draw the circular segment
 * - the center point of the circular segment
 * - coordinates of vertices of circular segment
 * - the height of the circular segment.
 * @param dataset array of objects, each object must contains a percentage property (a number in [0, 1])
 * @param radius circle radius
 * @param center circle center point
 * @param options options object
 */
export function computeCircularSegments<T extends Percentage>(
  dataset: T[],
  radius: number,
  center: Point,
  options?: Options
): Array<CirclularSegmentInfo<T>> {
  if (!dataset.length) {
    throw new Error(`The dataset must contain at least one element.`)
  }
  const percentageSum = sumBy(dataset, 'percentage')
  if (Math.abs(percentageSum - 1) < 0.001) {
    throw new Error(`The sum of 'percentage' values must be 1. Your sum is ${percentageSum}.`)
  }

  const cumulativePercentages = computeCumulativePercentages(dataset)
  const defaultedOptions = Object.assign({}, defaultOptions, options)
  return computeHeightsAndAngle(radius, center, cumulativePercentages, defaultedOptions)
}
