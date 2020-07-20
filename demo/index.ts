import 'tachyons'
import 'tachyons-extra'
import { select } from 'd3-selection'
import { generateData, randomColor } from './utils'
import { computeCircularSegmentsInfo } from '../src'
import { CirclularSegmentInfo } from '../src/lib/types'

///////////////////////////////////////////////////////////////////////////////

const notHighligthOpacityValue = 0.6
const size = 200
const r = size / 2
const cx = r
const cy = r

const root = select('#app')

///////////////////////////////////////////////////////////////////////////////

function createCircularSegments(parentNode: any) {
  // remove old viz
  root.selectAll('.paths-container').remove()
  // create new data
  const dataset = generateData([2, 6], 1)
  const circularSegmentsInfo: CirclularSegmentInfo[] = computeCircularSegmentsInfo(
    r,
    { x: cx, y: cy },
    dataset
  )
  console.log('dataset:', dataset)
  console.log('circularSegmentsInfo:', circularSegmentsInfo)
  // append viz
  parentNode
    .append('g')
    .attr('class', 'paths-container')
    .selectAll('.path')
    .data(circularSegmentsInfo)
    .enter()
    .append('path')
    .attr('class', (_, i) => `path-${i}`)
    .attr('d', (info) => info.path)
    .style('fill', () => randomColor())
    .attr('fill-opacity', notHighligthOpacityValue)
    .on('mouseover', function () {
      select(this).style('fill-opacity', 1)
    })
    .on('mouseout', function () {
      select(this).style('fill-opacity', notHighligthOpacityValue)
    })
}

///////////////////////////////////////////////////////////////////////////////

const container = root
  .append('div')
  .attr('class', 'flex flex-column bg-light-gray h-100 justify-center items-center')

const circleContainer = container.append('div')
const svg = circleContainer.append('svg').attr('width', size).attr('height', size)
const circularSegments = createCircularSegments(svg)

const randomButton = container
  .append('div')
  .attr('class', 'br-pill bg-black white pa2 mt3 flex flex-center pointer user-select-none')
  .html('Random')
  .on('click', function () {
    createCircularSegments(svg)
  })
