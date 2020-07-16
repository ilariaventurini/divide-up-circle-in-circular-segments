export function randomWithFixedSum(amount: number, sum: number) {
  const numbers = Array(amount).fill(0).map(Math.random)
  const randomSum = numbers.reduce((a, b) => a + b, 0)
  return numbers.map((n) => (n * sum) / randomSum)
}

export function randomColor() {
  return `#${Math.floor(Math.random() * 16777215).toString(16)}`
}
