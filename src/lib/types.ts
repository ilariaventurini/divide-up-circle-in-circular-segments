export interface Point {
  x: number
  y: number
}

export interface Percentage {
  percentage: number
}

export type CumulativePercentage<T> = T & Percentage & { cumulativePercentage: number }

export type CirclularSegmentInfo<T> = CumulativePercentage<T> & {
  height: number
  theta: number
  path: string
  circlularSegmentCenter: Point
}
