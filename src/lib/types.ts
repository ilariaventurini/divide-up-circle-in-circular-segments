export type Orientation = 'horizontal' | 'vertical'

export interface Point {
  x: number
  y: number
}

export interface Vertices {
  topLeft: Point
  topRight: Point
  bottomLeft: Point
  bottomRight: Point
}

export interface Percentage {
  percentage: number
}

export type CumulativePercentage<T> = T & Percentage & { cumulativePercentage: number }

export type CirclularSegmentInfo<T> = CumulativePercentage<T> & {
  h: number
  height: number
  cumulativeHeight: number
  theta: number
  path: string
  center: Point
  vertices: Vertices
}

export interface Options {
  orientation?: Orientation
}
