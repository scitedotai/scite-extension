const API_URL = 'https://api.scite.ai'

export const matchReference = async ({
  title,
  firstAuthor,
  postValidate = true
} = {}) => {
  const { fetch } = window
  const url = new URL(`${API_URL}/search/match_reference`)

  // glutton requires a non empty first author but can work wihout if post validate is off
  if (!firstAuthor) {
    firstAuthor = 'placeholder'
    postValidate = false
  }

  const params = new URLSearchParams({
    title,
    first_author: firstAuthor,
    post_validate: postValidate === true ? 'true' : 'false'
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
