import React, { useEffect, useState } from 'react' // eslint-disable-line

const { fetch } = window

const NOTICE_STATUSES = ['retracted', 'has expression of concern', 'withdrawn', 'has erratum', 'has correction']

export const fetchTallies = async (dois, retry = 0, maxRetries = 8) => {
  if (!dois || dois.length === 0) {
    return { tallies: {} }
  }

  const fetchFailed = new Error('Failed to get Tallies')
  try {
    const response = await fetch('https://api.scite.ai/tallies', {
      method: 'POST',
      body: JSON.stringify(dois),
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      }
    })
    if (response.status === 404) {
      return { tallies: {} }
    }

    if (!response.ok) {
      throw fetchFailed
    }
    const data = await response.json()
    return data || {}
  } catch (e) {
    if (e === fetchFailed && retry < maxRetries) {
      return await new Promise((resolve) => setTimeout(() => resolve(fetchTallies(dois, ++retry)), 600))
    } else {
      console.error(fetchFailed)
    }
  }
  return { tallies: {} }
}

export const fetchNotices = async (dois, retry = 0, maxRetries = 8) => {
  if (!dois || dois.length === 0) {
    return { notices: {} }
  }

  const fetchFailed = new Error('Failed to get notices')
  try {
    const response = await fetch('https://api.scite.ai/papers', {
      method: 'POST',
      body: JSON.stringify(dois),
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      }
    })
    if (response.status === 404) {
      return { notices: {} }
    }

    if (!response.ok) {
      throw fetchFailed
    }
    const data = await response.json()
    const notices = {}
    for (const paper in data.papers) {
      if (!data.papers[paper].editorialNotices) {
        notices[paper] = []
        continue
      }

      notices[paper] = [...new Set(data.papers[paper].editorialNotices
        .filter(({ status }) => NOTICE_STATUSES.includes(status.toLowerCase()))
        .map(({ status }) => status))]
    }
    return { notices }
  } catch (e) {
    if (e === fetchFailed && retry < maxRetries) {
      return await new Promise((resolve) => setTimeout(() => resolve(fetchNotices(dois, ++retry)), 600))
    } else {
      console.error(fetchFailed)
    }
  }
}

export const fetchSectionTallies = async (dois, retry = 0, maxRetries = 8) => {
  if (!dois || dois.length === 0) {
    return { tallies: {} }
  }

  const fetchFailed = new Error('Failed to get Section Tallies')
  try {
    const response = await fetch('https://api.scite.ai/tallies/cited-by-sections', {
      method: 'POST',
      body: JSON.stringify(dois),
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      }
    })
    if (response.status === 404) {
      return { tallies: {} }
    }

    if (!response.ok) {
      throw fetchFailed
    }
    const data = await response.json()
    return data || {}
  } catch (e) {
    if (e === fetchFailed && retry < maxRetries) {
      return await new Promise((resolve) => setTimeout(() => resolve(fetchSectionTallies(dois, ++retry)), 600))
    } else {
      console.error(fetchFailed)
    }
  }
  return { tallies: {} }
}
