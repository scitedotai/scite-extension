import React from 'react'
import { render, unmountComponentAtNode } from 'react-dom'
import Tally from '../components/Tally'
import SectionTally from '../components/SectionTally'
import { fetchNotices, fetchTallies, fetchSectionTallies } from './scite'
import Tooltip from '../components/Tooltip'
import '../styles/index.css'
import '../styles/typography.css'

const BATCH_SIZE = 500

const HOST_NAME = window.location.hostname

export function getConfig (el) {
  const data = el.dataset
  const config = {}
  const doi = getDOI(el)
  if (doi) {
    config.doi = doi
  }

  if (data.tallyShow) {
    config.tallyShow = data.tallyShow === 'true'
  } else {
    config.tallyShow = true
  }

  if (data.sectionTallyShow) {
    config.sectionTallyShow = data.sectionTallyShow === 'true'
  }

  if (data.showCites) {
    config.showCites = data.showCites === 'true'
  }

  if (data.showLogo) {
    config.showLogo = data.showLogo === 'true'
  }

  if (data.chartType) {
    config.chartType = data.chartType
  }

  if (data.showZero) {
    config.showZero = data.showZero === 'true'
  }

  if (data.forceCollapse) {
    config.forceCollapse = data.forceCollapse === 'true'
  }

  if (data.layout) {
    config.horizontal = data.layout === 'horizontal'
  }

  if (data.sectionTallyLayout) {
    config.horizontalSectionTally = data.sectionTallyLayout === 'horizontal'
  }

  if (data.tooltipPlacement) {
    config.placement = data.tooltipPlacement
  }

  if (data.tooltipSlide) {
    config.slide = Number(data.tooltipSlide)
  }

  if (data.showLabels) {
    config.showLabels = data.showLabels === 'true'
  }

  if (data.targetEl) {
    config.targetEl = data.targetEl
  }

  if (data.insertBefore) {
    config.insertBefore = data.insertBefore === 'true'
  }

  if (data.small) {
    config.small = data.small === 'true'
  }

  if (data.campaign) {
    config.campaign = data.campaign
  }

  if (data.autologin) {
    config.autologin = data.autologin
  }

  if (data.rewardfulId) {
    config.rewardfulID = data.rewardfulId
  }

  if (data.showTotal) {
    config.showTotal = data.showTotal === 'true'
  }

  if (data.useTestEnv) {
    config.useTestEnv = data.useTestEnv == 'true'
  }

  return config
}

function isSectionTally (el) {
  const data = el.dataset
  return data.sectionTallyShow === 'true'
}

function isRegularTally (el) {
  const data = el.dataset
  return ('tallyShow' in data && data.tallyShow !== null) ? data.tallyShow === 'true' : true
}

function getTallyAndSectionTallyDOIs (badgesToLoad) {
  const tallyDOIs = []
  const sectionTallyDOIs = []
  for (const badge of badgesToLoad) {
    const doi = getDOI(badge)
    if (isRegularTally(badge)) {
      tallyDOIs.push(doi)
    }
    if (isSectionTally(badge)) {
      sectionTallyDOIs.push(doi)
    }
  }

  return {
    tallyDOIs: [...new Set(tallyDOIs)],
    sectionTallyDOIs: [...new Set(sectionTallyDOIs)]
  }
}

function getDOI (el) {
  const data = el.dataset
  let doi

  if (data.doi && /^meta:/.test(data.doi)) {
    const metaName = data.doi.split('meta:').join('')
    const selector = `meta[name='${metaName}']`
    const meta = document.querySelector(selector)

    if (meta) {
      doi = meta.getAttribute('content')
    } else {
      console.warn(`Scite badge could not find meta tag with name="${metaName}"`)
    }
  } else if (data.doi) {
    doi = data.doi
  }
  return doi && doi.toLowerCase().trim()
}

export function insertBadge (el, tally, notices, sectionTally) {
  const config = getConfig(el)

  const tallyShow = config.tallyShow || false
  const sectionTallyShow = config.sectionTallyShow || false
  const showBothTallies = tallyShow && sectionTallyShow

  const doi = config.doi
  const showZero = config.showZero || false
  const showCites = typeof config.showCites === 'boolean' ? config.showCites : true
  const forceCollapse = config.forceCollapse || false
  const horizontal = config.horizontal || false
  const placement = config.placement || 'top'
  const showLabels = config.showLabels || false
  const slide = config.slide || 0
  const small = config.small || false
  const campaign = config.campaign || undefined
  const autologin = config.autologin || undefined
  const rewardfulID = config.rewardfulID || undefined
  const showLogo = config.showLogo || true
  const showTotal = typeof config.showTotal === 'boolean' ? config.showTotal : true

  // Section Tally related values
  const chartType = config.chartType || null
  const horizontalSectionTally = config.horizontalSectionTally

  //
  // Don't ever flip tooltip if they specify placement
  //
  const flip = !config.placement

  // If element is already existing on another react DOM
  // this method can throws an exception but does remove the node
  try {
    unmountComponentAtNode(el)
  } catch (_) {
    console.warn('Scite badge: unmounting component on another react DOM')
  }

  const tooltipProps = {
    doi,
    tally,
    showZero,
    placement,
    flip,
    slide,
    notices,
    showTotal
  }

  const tallyProps = {
    tally,
    horizontal,
    showZero,
    forceCollapse,
    showLabels,
    notices,
    small,
    source: HOST_NAME,
    campaign,
    autologin,
    rewardfulID,
    isBadge: true,
    showLogo,
    showTotal,
    showCites
  }

  const sectionTallyProps = {
    ...tallyProps,
    tally: sectionTally,
    horizontal: horizontalSectionTally,
    chartType
  }

  if (showBothTallies) {
    render(
      (
        <>
          <div style={{ display: 'inline-block', marginBottom: '4px' }}>
            <Tooltip {...tooltipProps}>
              <Tally {...tallyProps} />
            </Tooltip>
          </div>
          <div>
            <Tooltip
              {...tooltipProps}
              tallyType='sections'
            >
              <SectionTally {...sectionTallyProps} />
            </Tooltip>
          </div>
        </>
      ),
      el
    )
  } else if (tallyShow) {
    render(
      (
        <Tooltip {...tooltipProps}>
          <Tally {...tallyProps} />
        </Tooltip>
      ),
      el
    )
  } else if (sectionTallyShow) {
    render(
      (
        <Tooltip
          doi={doi}
          tally={sectionTally}
          showZero={showZero}
          placement={placement}
          flip={flip}
          slide={slide}
          tallyType='sections'
        >
          <SectionTally {...sectionTallyProps} />
        </Tooltip>
      ),
      el
    )
  }
}

/**
 * If the user cannot insert a div with config/class
 * we want, insert the wrapper ourselves as an escape hatch */
export function insertBadgeWrapper (configEl) {
  const { targetEl, insertBefore } = getConfig(configEl)

  const el = document.querySelector(targetEl)
  const badgeWrapper = document.createElement('div')
  badgeWrapper.className = 'scite-badge'

  //
  // Forward config to element
  //
  const configKeys = Object.keys(configEl.dataset)
  for (const key of configKeys) {
    badgeWrapper.dataset[key] = configEl.dataset[key]
  }

  if (!el) {
    console.warn('Scite badge: could not find element to insert badge wrapper into')
  }

  if (insertBefore) {
    const parent = el.parentNode
    parent.insertBefore(badgeWrapper, el)
  } else {
    el.appendChild(badgeWrapper)
  }

  return badgeWrapper
}

export async function insertBadges ({ forceReload } = {}) {
  if (!document.body) {
    return []
  }

  //
  // Note that for config we have already acted upon
  // we mark `injected` on the div to avoid re-injecting
  // the badge wrapper if the user calls `insertBadges`
  //
  const configEls = document.querySelectorAll('.scite-badge-config')
  for (const el of configEls) {
    if (el.dataset.injected === 'true') {
      continue
    }

    insertBadgeWrapper(el)
    el.dataset.injected = 'true'
  }

  const badges = document.querySelectorAll('.scite-badge')
  const badgesToLoad = []

  for (const badge of badges) {
    if (badge.dataset.fetched === 'true' && !forceReload) {
      continue
    }

    badgesToLoad.push(badge)
  }

  const { tallyDOIs, sectionTallyDOIs } = getTallyAndSectionTallyDOIs(badgesToLoad)
  if (tallyDOIs.length === 0 && sectionTallyDOIs.length === 0) {
    return badges
  }

  const pages = Math.max(Math.ceil(tallyDOIs.length / BATCH_SIZE), Math.ceil(sectionTallyDOIs.length / BATCH_SIZE))

  let doiTallyMap = {}
  let doiNoticeMap = {}
  let doiSectionTallyMap = {}

  for (let i = 0; i < pages; i++) {
    // We iterate to the largest list's batchSize.
    //   If we go past the smaller one's size, slice() will return []
    //   and nothing will be retrieved.
    const currentTallyDOIs = tallyDOIs.slice(i * BATCH_SIZE, (i + 1) * BATCH_SIZE)
    const currentSectionTallyDOIs = sectionTallyDOIs.slice(i * BATCH_SIZE, (i + 1) * BATCH_SIZE)

    const [{ tallies }, { notices }, { tallies: sectionTallies }] = await Promise.all([fetchTallies(currentTallyDOIs), fetchNotices(currentTallyDOIs), fetchSectionTallies(currentSectionTallyDOIs)])

    doiTallyMap = {
      ...doiTallyMap,
      ...tallies
    }
    doiNoticeMap = {
      ...doiNoticeMap,
      ...notices
    }
    doiSectionTallyMap = {
      ...doiSectionTallyMap,
      ...sectionTallies
    }

    for (const badge of badgesToLoad) {
      const doi = getDOI(badge)
      if ((doi in doiTallyMap) || (doi in doiSectionTallyMap)) {
        const tally = doi in doiTallyMap ? doiTallyMap[doi] : { total: 0, citingPublications: 0 }
        const noticeTally = doi in doiTallyMap ? notices[doi] : {}
        const sectionTally = doi in doiSectionTallyMap ? doiSectionTallyMap[doi] : {}
        insertBadge(badge, tally, noticeTally, sectionTally)
      } else {
        insertBadge(badge, { total: 0, citingPublications: 0 }, {}, {})
      }

      badge.dataset.fetched = 'true'
    }
  }

  return badges
}

export async function main () {
  const badges = await insertBadges()
  //
  // If we didn't find any, try waiting for document load
  // we may have been inserted further up the page
  //
  if (badges.length === 0) {
    window.addEventListener('load', insertBadges)
  }
}
