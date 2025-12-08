const blockedDomains = [
  'reprintsdesk.com'
]

export const allowRedirection = () => {
  const currentHost = window.location.hostname
  const isAllowed = !blockedDomains.some(domain => currentHost.endsWith(domain))
  return isAllowed
}

export const redirectionHandler = (url) => {
  if (!allowRedirection()) {
    return
  }

  window.open(url)
}
