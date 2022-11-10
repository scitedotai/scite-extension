import 'whatwg-fetch'
import React, { useEffect, useState } from 'react' // eslint-disable-line

const { fetch } = window

const NOTICE_STATUSES = ['retracted', 'has expression of concern', 'withdrawn', 'has erratum', 'has correction']

function fetchTally ({ doi, setTally, setError, retry = 0, maxRetries = 8 } = {}) {
  const fetchFailed = new Error('Failed to get Tally')
  fetch(`https://api.scite.ai/tallies/${doi}`)
    .then(response => {
      if (response.status === 404) {
        // Then we will set a 0 tally
        setTally({
          doi,
          total: 0,
          citingPublications: 0
        })

        return {}
      }

      if (!response.ok) {
        throw fetchFailed
      }

      return response.json()
    })
    .then(tally => {
      if (typeof tally.total === 'number') {
        setTally(tally)
      }
    })
    .catch(e => {
      if (e === fetchFailed && retry < maxRetries) {
        return setTimeout(() => fetchTally({ retry: ++retry, doi, setTally, setError, maxRetries }), 1200)
      }

      setError(e)
    })
}

function fetchNotices ({ doi, setNotices, setError, retry = 0, maxRetries = 8 } = {}) {
  const fetchFailed = new Error('Failed to get notices')
  fetch(`https://api.scite.ai/papers/${doi}`)
    .then(response => {
      if (response.status === 404) {
        // Then we will set a notices to []
        setNotices([])

        return {}
      }

      if (!response.ok) {
        throw fetchFailed
      }

      return response.json()
    })
    .then(({ editorialNotices }) => {
      // Filter out statuses that are not interesting and remove duplicates.
      const notices = [...new Set(editorialNotices
        .filter(({ status }) => NOTICE_STATUSES.includes(status.toLowerCase()))
        .map(({ status }) => status))]
      setNotices(notices)
    })
    .catch(e => {
      if (e === fetchFailed && retry < maxRetries) {
        return setTimeout(() => fetchNotices({ retry: ++retry, doi, maxRetries, setError, setNotices }), 1200)
      }

      setError(e)
    })
}

export const TallyLoader = ({ doi, children }) => {
  const [tally, setTally] = useState(null)
  const [notices, setNotices] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchTally({ doi, setTally, setError })
    fetchNotices({ doi, setNotices, setError })
  }, [doi])

  return children({ tally, notices, error })
}

export default TallyLoader
