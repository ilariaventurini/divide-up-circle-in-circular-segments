import { select } from 'd3-selection'
import { random } from 'lodash'
import { randomWithFixedSum, randomColor } from './utils'
import { findAreasInfo } from '../src'

const root = select('#app')

///////////////////////////////

function generateData() {
  const n = random(2, 6)
  const percentages = randomWithFixedSum(n, 1)
  const dataset = percentages.map((p) => ({
    F: p,
    color: randomColor(),
  }))
  return dataset
}

///////////////////////////////

const size = 400
const r = size / 2
const cx = r
const cy = r

const info = findAreasInfo(r, cx, cy, generateData()) as any
console.log('info: ', info)

const circles = info.map((ii) => `<path d="${ii.d}" fill="${ii.color}" />`)
console.log('circles: ', circles)

root.append('svg').attr('width', size).attr('height', size).html(circles)
