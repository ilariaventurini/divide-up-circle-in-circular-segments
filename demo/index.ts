import 'tachyons'
import 'tachyons-extra'
import { select, selectAll, Selection } from 'd3-selection'
import { generateData, COUNTER_EXTENT, roundToTwoDecimals } from './utils'
import { computeCircularSegments } from '../dist'
import { Orientation } from '../dist/lib/types'

const debug = false

const opacity = 0.6
const overedOpacity = 0.8
const size = 250
const r = size / 2
const cx = r
const cy = r
const sumValue = 1

let orientation = 'horizontal' as Orientation

///////////////////////////////////////////////////////////////////////////////

const root = select('#app')
const container = root.append('div').attr('class', 'w-100 h-100 flex flex-center')
createCircularSegments(container)

///////////////////////////////////////////////////////////////////////////////

function createCircularSegments(
  container: Selection<HTMLDivElement, unknown, HTMLElement, any>,
  oldDataset?: Array<{ percentage: number; color: string }>
) {
  const radios = `
  <div class='flex ${debug ? 'ba' : ''}'>
    <div class='b mr2'>Orientation:</div>
    <form id='orientations'>
      <input class='mr1 pointer' type='radio' value='horizontal' name='orientation' ${
        orientation === 'horizontal' ? 'checked' : ''
      }>horizontal</input>
      <input class='ml2 mr1 pointer' type='radio' value='vertical' name='orientation' ${
        orientation === 'vertical' ? 'checked' : ''
      }>vertical</input>
    </form>
  </div>`

  // remove old viz
  container.selectAll('#example').remove()

  const example = container
    .append('div')
    .attr('id', 'example')
    .attr('class', `${debug ? 'ba b--black' : ''} flex flex-column`)

  const orientationButtons = example
    .append('div')
    .attr('id', 'orientation-radio')
    .attr('class', `${debug ? 'bg-orange' : ''} `)
    .html(radios)

  const contentContainer = example
    .append('div')
    .attr('id', 'example')
    .attr('class', `${debug ? 'ba b--black' : ''} flex`)

  const leftColumn = contentContainer
    .append('div')
    .attr('class', `${debug ? 'ba b--red bw1' : ''} flex flex-column items-center`)

  const rightColumn = contentContainer
    .append('div')
    .attr('class', `${debug ? 'bg-blue' : ''} pl3 flex flex-column`)
    .style('min-width', 100)

  const svg = leftColumn.append('svg').attr('width', size).attr('height', size)

  const legendContainer = rightColumn.append('div').attr('class', `${debug ? 'bg-yellow' : ''}`)

  // create new data
  const dataset = oldDataset ? oldDataset : generateData(COUNTER_EXTENT, sumValue)

  const circularSegments = computeCircularSegments(
    dataset,
    r,
    { x: cx, y: cy },
    { orientation: orientation }
  )

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

  if (debug) {
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
  }

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
    .html((d) => `${roundToTwoDecimals(d.percentage * 100)} %`)

  // append button
  const randomButton = leftColumn
    .append('div')
    .attr('class', 'button br1 pa2 mt3 flex flex-center pointer user-select-none w3')
    .html('Again!')
    .on('click', function () {
      createCircularSegments(container)
    })

  // orientation radio buttons
  selectAll("input[name='orientation']").on('change', function (d) {
    // @ts-ignore
    orientation = this.value
    createCircularSegments(container, dataset)
  })
}
