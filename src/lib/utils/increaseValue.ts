export const increaseValue = (value: number, increase: number): number => {
  const newValue = value + increase
  return newValue >= 100 ? 100 : newValue
}
