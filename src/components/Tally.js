import React from 'react'
import qs from 'query-string'
import classNames from 'classnames'
import Count from './Count'

import styles from '../styles/Tally.css'

const RETRACTED_LEMMAS = ['retract', 'withdraw', 'remove']

const noticesFilter = status => {
  for (const retractedLemma of RETRACTED_LEMMAS) {
    if (status && status.toLowerCase().includes(retractedLemma)) {
      return false
    }
  }
  return true
}

const retractionFilter = status => {
  for (const retractedLemma of RETRACTED_LEMMAS) {
    if (status && status.toLowerCase().includes(retractedLemma)) {
      return true
    }
  }
  return false
}

const Tally = ({
  source, campaign, autologin, rewardfulID,
  tally, forceCollapse, showLabels, notices,
  small = false, horizontal = false, isBadge = false, showZero = true,
  showLogo = true
}) => {
  const params = {
    utm_medium: isBadge ? 'badge' : 'plugin',
    utm_source: source || 'generic',
    utm_campaign: campaign || isBadge ? 'badge' : 'plugin'
  }

  if (autologin) {
    params.autologin = autologin
  }

  if (rewardfulID) {
    params.via = rewardfulID
  }

  const queryString = qs.stringify(params)

  const classes = {
    tally: classNames('scite-tally', styles.tally, {
      [styles.horizontal]: horizontal,
      [styles.small]: small && horizontal,
      [styles.show]: showZero ? tally : tally && (tally.total > 0 || tally.citingPublications > 0),
      [styles.forceCollapse]: forceCollapse && tally.total === 0 && tally.citingPublications === 0,
      [styles.badgeTally]: isBadge
    })
  }
  const citingPublications = (tally && tally.citingPublications && tally.citingPublications.toLocaleString()) || 0
  const supporting = (tally && tally.supporting && tally.supporting.toLocaleString()) || 0
  const contrasting = (tally && tally.contradicting && tally.contradicting.toLocaleString()) || 0
  const mentioning = (tally && tally.mentioning && tally.mentioning.toLocaleString()) || 0

  const retractionNotices = (notices && notices.length > 0 && notices.filter(retractionFilter)) || []
  const editorialNotices = (notices && notices.length > 0 && notices.filter(noticesFilter)) || []
  const retractionsCount = retractionNotices.length.toLocaleString() || 0
  const noticeCount = editorialNotices.length.toLocaleString() || 0

  const handleClick = () => {
    window.open(`https://scite.ai/reports/${tally && tally.doi}?${queryString}`)
  }

  return (
    <div
      className={classes.tally}
      onClick={handleClick}
    >
      {(!horizontal && showLogo) && (
        <img
          className={classNames(styles.logo, {
            [styles.logoSmall]: small
          })}
          src='https://cdn.scite.ai/assets/images/logo.svg'
        />
      )}
      <Count type='publications' count={citingPublications} horizontal={horizontal} showLabels={showLabels} small={small} />
      <Count type='supporting' count={supporting} horizontal={horizontal} showLabels={showLabels} small={small} />
      <Count type='mentioning' count={mentioning} horizontal={horizontal} showLabels={showLabels} small={small} />
      <Count type='contrasting' count={contrasting} horizontal={horizontal} showLabels={showLabels} small={small} />
      {retractionsCount > 0 && <Count type='retractions' count={retractionsCount} horizontal={horizontal} showLabels={showLabels} small={small} />}
      {noticeCount > 0 && <Count type='notices' count={noticeCount} horizontal={horizontal} showLabels={showLabels} small={small} />}
    </div>
  )
}

export default Tally
