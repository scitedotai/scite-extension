export const getCountNumber = (count) => {
  return typeof count === 'number'
    ? count
    : typeof count === 'string' ? Number(count.replaceAll(',', '')) : count
}
