import 'tachyons'
import 'tachyons-extra'
import { round } from 'lodash'
import { select, selectAll, Selection } from 'd3-selection'
import { generateData, COUNTER_EXTENT } from './utils'
import { computeCircularSegments } from '../src'

const debug = true

const opacity = 0.6
const overedOpacity = 0.8
const size = 250
const r = size / 2
const cx = r
const cy = r
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
    .attr('class', `${debug ? 'ba b--red bw1' : ''} flex flex-column`)
  // .attr('class', `${debug ? 'bg-red' : ''} flex flex-column items-center`)

  const rightColumn = contentContainer
    .append('div')
    .attr('class', `${debug ? 'bg-blue' : ''} pl3 flex flex-column`)
    .style('min-width', 100)

  const svg = leftColumn.append('svg').attr('width', size).attr('height', size)

  const legendContainer = rightColumn.append('div').attr('class', `${debug ? 'bg-yellow' : ''}`)

  // create new data
  const dataset = generateData(COUNTER_EXTENT, sumValue)
  const circularSegments = computeCircularSegments(dataset, r, { x: cx, y: cy })
  console.log('circularSegments: ', circularSegments)

  // append viz
  const selectionJoin = svg
    .append('g')
    .attr('class', 'paths-container')
    .selectAll('.path')
    .data(circularSegments)
    .enter()

  // paths
  selectionJoin
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

  // centers
  selectionJoin
    .append('circle')
    .attr('cx', (datum) => datum.center.x)
    .attr('cy', (datum) => datum.center.y)
    .attr('r', 1)
    .attr('fill', 'white')

  // vertices
  const vertices = selectionJoin.append('g')
  vertices
    .append('circle')
    .attr('class', '-topLeft')
    .attr('cx', (datum) => datum.vertices.topLeft.x)
    .attr('cy', (datum) => datum.vertices.topLeft.y)
    .attr('r', 3)
    .attr('fill', 'tomato')
  vertices
    .append('circle')
    .attr('class', '-topRight')
    .attr('cx', (datum) => datum.vertices.topRight.x)
    .attr('cy', (datum) => datum.vertices.topRight.y)
    .attr('r', 3)
    .attr('fill', 'orange')
  vertices
    .append('circle')
    .attr('class', '-bottomLeft')
    .attr('cx', (datum) => datum.vertices.bottomLeft.x)
    .attr('cy', (datum) => datum.vertices.bottomLeft.y)
    .attr('r', 3)
    .attr('fill', 'yellow')
  vertices
    .append('circle')
    .attr('class', '-bottomRight')
    .attr('cx', (datum) => datum.vertices.bottomRight.x)
    .attr('cy', (datum) => datum.vertices.bottomRight.y)
    .attr('r', 3)
    .attr('fill', 'purple')

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
