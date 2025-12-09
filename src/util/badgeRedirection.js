const blockedDomains = [
  'reprintsdesk.com'
]

export const allowRedirection = () => {
  const currentHost = window.location.hostname
  return !blockedDomains.some(domain => currentHost.endsWith(domain))
}

export const redirectionHandler = (url) => {
  if (!allowRedirection()) {
    return
  }

  window.open(url, '_blank', 'noopener,noreferrer')
}
