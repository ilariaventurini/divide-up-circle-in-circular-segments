import { random } from 'lodash'

const COUNTER_EXTENT = [2, 6] as [number, number]

// Return an array of 'amount' numbers whose sum is exactly 'sum'
export function randomWithFixedSum(amount: number, sum: number) {
  const numbers = Array(amount).fill(0).map(Math.random)
  const randomSum = numbers.reduce((a, b) => a + b, 0)
  const generated = numbers.map((n) => (n * sum) / randomSum)
  // Sometimes the percentages sum is !== 1. This is due to JS floating point error.
  // In these case generate the numbers again
  const diff = generated.reduce((a, g) => a + g, 0) - sum
  return diff ? randomWithFixedSum(amount, sum) : generated
}

// Return a random hex color
export function randomColor() {
  return '#' + ('000000' + Math.random().toString(16).slice(2, 8).toUpperCase()).slice(-6)
}

// Generate an array of numbers with length in 'counterExtents' and the sum of the numbers is equal to 'sumValue'
export function generateData(
  counterExtents = COUNTER_EXTENT,
  sumValues = 1
): Array<{ percentage: number; color: string }> {
  const [minCounter, maxCounter] = counterExtents
  const n = random(minCounter, maxCounter)
  const percentages = randomWithFixedSum(n, sumValues)
  return percentages.map((p) => ({ percentage: p, color: randomColor() }))
}
