import React from 'react'
import qs from 'query-string'
import classNames from 'classnames'
import SectionTallyCount from './SectionTallyCount'

import styles from '../styles/SectionTally.css'
import BarChart from './BarChart'
import PieChart from './PieChart'
import DonutChart from './DonutChart'
import { generateChartDataFromSectionTally, CHART_TYPES } from '../util/sectionTally'

const SectionTally = ({
  source, campaign, autologin, rewardfulID,
  tally, forceCollapse, showLabels,
  small = false, horizontal = false, isBadge = false, showZero = true,
  chartType = null, showLogo = true
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
    sectionTallyContainer: classNames('scite-section-tally', styles.sectionTallyWidget),
    sectionTally: classNames(styles.tally, {
      [styles.horizontal]: horizontal,
      [styles.small]: small && horizontal,
      [styles.show]: showZero ? tally : tally && (tally.total > 0),
      [styles.forceCollapse]: forceCollapse && tally.total === 0,
      [styles.badgeTally]: isBadge
    })
  }

  const introduction = (tally && tally.introduction && tally.introduction.toLocaleString()) || 0
  const methods = (tally && tally.methods && tally.methods.toLocaleString()) || 0
  const results = (tally && tally.results && tally.results.toLocaleString()) || 0
  const discussion = (tally && tally.discussion && tally.discussion.toLocaleString()) || 0
  const other = (tally && tally.other && tally.other.toLocaleString()) || 0

  const reportLink = `https://scite.ai/reports/${tally && tally.doi}?${queryString}`
  const handleClick = () => {
    window.open(reportLink)
  }

  const chartData = generateChartDataFromSectionTally(tally)
  const showChart = Object.values(CHART_TYPES).includes(chartType)
  if (chartType && !showChart) {
    console.warn(`Received unexpected chartType: ${chartType}. Must be 'pie', 'bar', 'donut', or null.`)
  }

  return (
    <div
      className={classes.sectionTallyContainer}
    >
      {(!horizontal && showLogo) && (
        <img
          className={classNames(styles.logo, {
            [styles.logoSmall]: small
          })}
          src='https://cdn.scite.ai/assets/images/logo.svg'
        />
      )}
      <div
        onClick={handleClick}
        className={styles.sectionTallyWrapper}
      >
        {chartType === 'bar' && (
          <BarChart chartWidth={140} chartHeight={130} data={chartData} />
        )}

        {chartType === 'pie' && (
          <PieChart chartWidth={140} chartHeight={140} data={chartData} />
        )}

        {chartType === 'donut' && (
          <DonutChart data={chartData} size={140} />
        )}

        <div
          className={classes.sectionTally}
        >
          <SectionTallyCount type='introduction' count={introduction} horizontal={horizontal} showLabels={showLabels} small={small} />
          <SectionTallyCount type='methods' count={methods} horizontal={horizontal} showLabels={showLabels} small={small} />
          <SectionTallyCount type='results' count={results} horizontal={horizontal} showLabels={showLabels} small={small} />
          <SectionTallyCount type='discussion' count={discussion} horizontal={horizontal} showLabels={showLabels} small={small} />
          <SectionTallyCount type='other' count={other} horizontal={horizontal} showLabels={showLabels} small={small} />
        </div>

      </div>

      {showChart && (
        <div className={styles.chartSubheading}>
          <span className={styles.chartLabel}>Sections</span>
          <a href={reportLink} target='_blank' rel='noopener noreferrer'>See more details</a>
        </div>
      )}
    </div>
  )
}

export default SectionTally
