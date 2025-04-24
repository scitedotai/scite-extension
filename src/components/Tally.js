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

const isNonZero = ({ tally, notices, showCites }) => {
  const hasNotices = !!notices?.length
  const hasCites = tally && (tally.total > 0 || tally.citingPublications > 0)

  if (!showCites) {
    return hasNotices
  }

  return hasNotices || hasCites
}

const Tally = ({
  source, campaign, autologin, rewardfulID,
  tally, forceCollapse, showLabels, notices,
  small = false, horizontal = false, isBadge = false, showZero = true,
  showLogo = true, showTotal = true, showCites = true, useTestEnv = false,
  verticalCompact = false,
  showRetractions = true,
  showNotices = true,
  animatedBorder = false
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

  const sciteBaseUrl = useTestEnv ? 'https://staging.scite.ai' : 'https://scite.ai'

  const queryString = qs.stringify(params)

  const classes = {
    tally: classNames('scite-tally', styles.tally, {
      [styles.horizontal]: horizontal,
      [styles.small]: small && horizontal,
      [styles.show]: showZero ? tally : isNonZero({ tally, notices, showCites }),
      [styles.forceCollapse]: forceCollapse && tally.total === 0 && tally.citingPublications === 0,
      [styles.badgeTally]: isBadge,
      [styles.verticalTally]: verticalCompact
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
    window.open(`${sciteBaseUrl}/reports/${tally && tally.doi}?${queryString}`)
  }

  const Counters = () => (
    <>
      {showCites && showTotal && <Count type='publications' count={citingPublications} horizontal={horizontal} showLabels={showLabels} small={small} verticalCompact={verticalCompact} />}

      {verticalCompact && <div className={styles.separator} />}
      {showCites && <Count type='supporting' count={supporting} horizontal={horizontal} showLabels={showLabels} small={small} verticalCompact={verticalCompact} />}

      {verticalCompact && <div className={styles.separator} />}
      {showCites && <Count type='mentioning' count={mentioning} horizontal={horizontal} showLabels={showLabels} small={small} verticalCompact={verticalCompact} />}

      {verticalCompact && <div className={styles.separator} />}
      {showCites && <Count type='contrasting' count={contrasting} horizontal={horizontal} showLabels={showLabels} small={small} verticalCompact={verticalCompact} />}

      {(verticalCompact && retractionsCount > 0 && showRetractions) && <div className={styles.separator} />}
      {(retractionsCount > 0 && showRetractions) && <Count type='retractions' count={retractionsCount} horizontal={horizontal} showLabels={showLabels} small={small} verticalCompact={verticalCompact} />}

      {(verticalCompact && noticeCount > 0 && showNotices) && <div className={styles.separator} />}
      {(noticeCount > 0 && showNotices) && <Count type='notices' count={noticeCount} horizontal={horizontal} showLabels={showLabels} small={small} verticalCompact={verticalCompact} />}
    </>
  )

  const TallyContent = () => (
    <>
      {(!horizontal && showLogo && !verticalCompact) && (
        <img
          className={classNames(styles.logo, {
            [styles.logoSmall]: small
          })}
          src='https://cdn.scite.ai/assets/images/logo.svg'
        />
      )}

      <Counters />
    </>
  )

  return (
    <div
      className={classNames(classes.tally, {
        [styles.animatedBorderContainer]: animatedBorder,
        [styles.noDefaultBorder]: animatedBorder
      })}
      onClick={handleClick}
    >
      {!animatedBorder && <TallyContent />}

      {animatedBorder && (
        <>
          <div className={styles.animatedBorder} />

          <div className={styles.dataContainer}>
            <TallyContent />
          </div>
        </>
      )}
    </div>
  )
}

export default Tally
