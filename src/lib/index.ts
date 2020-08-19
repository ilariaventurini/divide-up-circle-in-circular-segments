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
  if (percentageSum !== 1) {
    throw new Error(`The sum of 'percentage' values must be 1. Your sum is ${percentageSum}.`)
  }

  const cumulativePercentages = computeCumulativePercentages(dataset)
  const defaultedOptions = Object.assign({}, defaultOptions, options)
  return computeHeightsAndAngle(radius, center, cumulativePercentages, defaultedOptions)
}

// [
//   {
//     center: { x: 125, y: 42.5192806380935 },
//     color: '#ff787a',
//     cumulativeHeight: 85.038561276187,
//     cumulativePercentage: 0.3,
//     height: 85.038561276187,
//     path:
//       'M 125 0 L 125 0 A 125 125 2.4907848665483074 0 0 6.559789703315133 85.038561276187 L 243.44021029668488 85.038561276187 A 125 125 2.4907848665483074 0 0 125 0',
//     percentage: 0.3,
//     theta: 2.4907848665483074,
//     vertices: {
//       bottomLeft: { x: 6.559789703315133, y: 85.038561276187 },
//       bottomRight: { x: 243.44021029668488, y: 85.038561276187 },
//       topLeft: { x: 125, y: 0 },
//       topRight: { x: 125, y: 0 },
//     },
//   },

//   {
//     center: { x: 125, y: 114.87779275059447 },
//     color: '#7f7ad9',
//     cumulativeHeight: 144.71702422500195,
//     cumulativePercentage: 0.6,
//     height: 59.67846294881495,
//     path:
//       'M 6.559789703315133 85.038561276187 L 6.559789703315133 85.038561276187 A 125 125 3.458388104829322 0 0 1.5648390623211128 144.71702422500195 L 248.4351609376789 144.71702422500195 A 125 125 3.458388104829322 0 0 243.44021029668488 85.038561276187',
//     percentage: 0.3,
//     theta: 3.458388104829322,
//     vertices: {
//       bottomLeft: { x: 1.5648390623211128, y: 144.71702422500195 },
//       bottomRight: { x: 248.4351609376789, y: 144.71702422500195 },
//       topLeft: { x: 6.559789703315133, y: 85.038561276187 },
//       topRight: { x: 243.44021029668488, y: 85.038561276187 },
//     },
//   },

//   {
//     center: { x: 125, y: 197.35850880445616 },
//     color: '#74dfc9',
//     cumulativeHeight: 249.99999338391035,
//     cumulativePercentage: 1,
//     height: 105.2829691589084,
//     path:
//       'M 1.5648390623211128 144.71702422500195 L 1.5648390623211128 144.71702422500195 A 125 125 6.282534592386832 0 0 124.95933032618038 249.99999338391035 L 125.04066967381962 249.99999338391035 A 125 125 6.282534592386832 0 0 248.4351609376789 144.71702422500195',
//     percentage: 0.4,
//     theta: 6.282534592386832,
//     vertices: {
//       bottomLeft: { x: 124.95933032618038, y: 249.99999338391035 },
//       bottomRight: { x: 125.04066967381962, y: 249.99999338391035 },
//       topLeft: { x: 1.5648390623211128, y: 144.71702422500195 },
//       topRight: { x: 248.4351609376789, y: 144.71702422500195 },
//     },
//   },
// ]
