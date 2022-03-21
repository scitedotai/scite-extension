const API_URL = 'https://api.scite.ai'

export const matchReference = async ({
  title,
  firstAuthor
} = {}) => {
  const { fetch } = window
  const url = new URL(`${API_URL}/search/match_reference`)

  const params = new URLSearchParams({
    title,
    first_author: firstAuthor
  })
  url.search = params.toString()
  try {
    const result = await fetch(url)
    const data = await result.json()
    return data
  } catch (e) {
    return null
  }
}
