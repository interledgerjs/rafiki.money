export const formatCurrency = (value: number, scale: number) => {
  return (value*10**(-scale)).toFixed(scale)
}
