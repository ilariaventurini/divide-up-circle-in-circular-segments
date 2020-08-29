/**
 * Given an array of objects, it returns the sum of the values ​​contained in the columnName column.
 * @param dataset the array to iterate over
 * @param columnName column name
 */
export function sumBy(dataset: any[], columnName: string) {
  return dataset.reduce((acc, curr) => acc + curr[columnName], 0)
}

/**
 * Produces a random number between lower and upper bounds.
 * @param lower lower bound
 * @param upper upper bound
 */
export function randomIntFromInterval(lower: number, upper: number) {
  return Math.floor(Math.random() * (upper - lower + 1) + lower)
}
