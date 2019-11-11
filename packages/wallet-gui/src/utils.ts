export function formatEpoch(epoch: number) {
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

  const date = new Date(epoch)
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}, ${padLeft(date.getHours().toString(), '0', 2)}:${padLeft(date.getMinutes().toString(), '0', 2)}`
}

function padLeft(text: string, padCharacter: string, padding: number) {
  if (text.length >= padding) {
    return text
  }

  let paddedText = text
  for(let count = 0; count < padding - text.length; count++) {
    paddedText = padCharacter + paddedText
  }

  return paddedText
}

export const formatCurrency = (value: number, scale: number) => {
  return (value*10**(-scale)).toFixed(scale)
}
