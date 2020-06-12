export const decreaseValue = (value: number, decrease: number): number => {
  const newValue = value - decrease
  return newValue <= 0 ? 0 : newValue
}
