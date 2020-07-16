import { Part, PartWithCum } from './types'
import { circularSegmentHeight, sqrt } from './math-utils'

export function findAreasInfo(r: number, cx: number, cy: number, parts: Part[]) {
  const cumulativeParts = parts.reduce((r: Part[], value, i) => {
    const { F, color } = value
    const cumF = i === 0 ? 0 : (r[i - 1] as PartWithCum).Fcum
    const newDatum = { F, Fcum: F + cumF, color } as PartWithCum
    r.push(newDatum)
    return r
  }, []) as PartWithCum[]
  console.log('cumulativeParts:', cumulativeParts)
  const coords = cumulativeParts.map(({ F, Fcum, color }, i) => {
    return { color, F1: F, ...circularSegmentHeight(F, Fcum, r) }
  })

  // compute the path string
  const coordWithPathString = coords.map((c, i) => {
    const isFirst = i === 0
    const hTop = isFirst ? 0 : coords[i - 1].h
    const hBottom = c.h
    const sweep = 0

    const xLeftTop = cx + sqrt(hTop * (2 * r - hTop))
    const xRightTop = cx - sqrt(hTop * (2 * r - hTop))
    const xLeftBottom = cx + sqrt(hBottom * (2 * r - hBottom))
    const xRightBottom = cx - sqrt(hBottom * (2 * r - hBottom))

    const d = `M ${xLeftTop} ${hTop}
        L ${xRightTop} ${hTop}
        A ${r} ${r} ${c.theta} ${0} ${sweep} ${xRightBottom} ${hBottom}
        L ${xLeftBottom} ${hBottom}
        A ${r} ${r} ${c.theta} ${0} ${sweep} ${xLeftTop} ${hTop}`
    return { ...c, d }
  })

  return coordWithPathString
}
