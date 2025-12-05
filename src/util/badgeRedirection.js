export const allowRedirection = () => {
  return !window.location.host.includes('reprintsdesk.com')
}

export const redirectionHandler = (url) => {
  if (!allowRedirection()) {
    return
  }

  window.open(url)
}
