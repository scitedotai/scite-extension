export const sliceIntoChunks = (arr, n = 10) => arr.reduce((resultArray, item, index) => {
  const chunkIndex = Math.floor(index / n)

  if (!resultArray[chunkIndex]) {
    resultArray[chunkIndex] = [] // start a new chunk
  }

  resultArray[chunkIndex].push(item)

  return resultArray
}, [])
