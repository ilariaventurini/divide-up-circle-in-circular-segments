export type Point = { x: number; y: number }
export type Percentage = number
export type CumulativePercentage = { percentage: number; cumulativePercentage: number }
export type CirclularSegmentInfo = {
  height?: number
  theta: number
  percentage: number
  cumulativePercentage?: number
  path?: string
  circlularSegmentCenter?: Point
}
