import 'tachyons'
import 'tachyons-extra'
import { round } from 'lodash'
import { select, selectAll, Selection } from 'd3-selection'
import { generateData } from './utils'
import { computeCircularSegments } from '../src'

const debug = false

const opacity = 0.6
const overedOpacity = 0.8
const size = 250
const r = size / 2
const cx = r
const cy = r
const numberOfSegmentsExtent = [2, 8] as [number, number]
const sumValue = 1

///////////////////////////////////////////////////////////////////////////////

const root = select('#app')
const container = root.append('div').attr('class', 'w-100 h-100 flex flex-center')
createCircularSegments(container)

///////////////////////////////////////////////////////////////////////////////

function createCircularSegments(container: Selection<HTMLDivElement, unknown, HTMLElement, any>) {
  // remove old viz
  container.selectAll('#example').remove()

  const contentContainer = container
    .append('div')
    .attr('id', 'example')
    .attr('class', `${debug ? 'ba b--black' : ''} flex`)

  const leftColumn = contentContainer
    .append('div')
    .attr('class', `${debug ? 'bg-red' : ''} flex flex-column items-center`)

  const rightColumn = contentContainer
    .append('div')
    .attr('class', `${debug ? 'bg-blue' : ''} pl3 flex flex-column`)
    .style('min-width', 100)

  const svg = leftColumn.append('svg').attr('width', size).attr('height', size)

  const legendContainer = rightColumn.append('div').attr('class', `${debug ? 'bg-yellow' : ''}`)

  // create new data
  const dataset = generateData(numberOfSegmentsExtent, sumValue)
  const circularSegments = computeCircularSegments(r, { x: cx, y: cy }, dataset)

  // append viz
  svg
    .append('g')
    .attr('class', 'paths-container')
    .selectAll('.path')
    .data(circularSegments)
    .enter()
    .append('path')
    .attr('class', (_, i) => `path-${i}`)
    .attr('d', (info) => info.path)
    .style('fill', (datum) => datum.color)
    .attr('fill-opacity', opacity)
    .on('mouseover', function (_, i) {
      select(this).style('fill-opacity', overedOpacity)
      select(`.legend-item-${i}`).style('opacity', overedOpacity)
    })
    .on('mouseout', function () {
      select(this).style('fill-opacity', opacity)
      selectAll(`.item`).style('opacity', opacity)
    })

  // append legend
  const legendEnterSelection = legendContainer
    .selectAll('.legend-item')
    .data(circularSegments)
    .enter()
    .append('div')
    .attr(
      'class',
      (_, i) =>
        `flex items-center ${i !== circularSegments.length - 1 ? 'mb2' : ''} ${debug ? 'ba' : ''}`
    )

  legendEnterSelection
    .append('div')
    .attr('class', (_, i) => `legend-item-${i} item br-100 w1 h1`)
    .style('opacity', opacity)
    .style('background-color', (datum) => datum.color)
  legendEnterSelection
    .append('div')
    .attr('class', 'ml2')
    .html((d) => `${round(d.percentage * 100, 2)} %`)

  // append button
  const randomButton = leftColumn
    .append('div')
    .attr('class', 'button br1 pa2 mt3 flex flex-center pointer user-select-none w3')
    .html('Again!')
    .on('click', function () {
      createCircularSegments(container)
    })
}
