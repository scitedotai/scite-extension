import React, { useState, useEffect } from 'react'
import classNames from 'classnames'
import { Manager, Reference, Popper } from 'react-popper'
import Count from './Count'
import SectionTallyCount from './SectionTallyCount'
import styles from '../styles/Tooltip.css'

const SectionTally = ({ className, tally }) => (
  <div className={classNames(styles.tally, className)}>
    <div className={styles.tallyCounts}>
      <SectionTallyCount type='introduction' count={(tally && tally.introduction && tally.introduction.toLocaleString()) || 0} showLabels />
      <SectionTallyCount type='methods' count={(tally && tally.methods && tally.methods.toLocaleString()) || 0} showLabels />
      <SectionTallyCount type='results' count={(tally && tally.results && tally.results.toLocaleString()) || 0} showLabels />
      <SectionTallyCount type='discussion' count={(tally && tally.discussion && tally.discussion.toLocaleString()) || 0} showLabels />
      <SectionTallyCount type='other' count={(tally && tally.other && tally.other.toLocaleString()) || 0} showLabels />
    </div>
  </div>
)

const NoticeCounts = ({ notices }) => {
  if (!notices || notices.length === 0 || !Array.isArray(notices)) {
    return null
  }

  const counts = notices.reduce((acc, nextStatus) => {
    if (!acc[nextStatus]) {
      acc[nextStatus] = 0
    }

    acc[nextStatus] += 1

    return acc
  }, {})

  return (
    <div className={styles.notices}>
      {notices.map((status, i) => (
        <div key={`${i}-${status}`} className={styles.notice}>
          <div className={styles.tallyCounts}>
            {(status === 'Retracted' || status === 'Withdrawn')
              ? (
                <Count type='retractions' />
                )
              : (
                <Count type='notices' />
                )}
          </div>
          <div className={styles.noticeLabel}>
            {(status === 'Retracted' || status === 'Withdrawn')
              ? (
                <span className={classNames(styles.retractionsCopy, styles[status])}>
                  This paper has been {status.toLowerCase()} {counts[status]} {counts[status] === 1 ? 'time' : 'times'}
                </span>
                )
              : (
                <span className={classNames(styles.noticeCopy, styles[status])}>
                  This paper {status.toLowerCase().replace('has ', `has ${counts[status]} `)}
                </span>
                )}
          </div>
        </div>
      ))}
    </div>
  )
}

const Tally = ({ className, tally, notices, showTotal }) => (
  <div className={classNames(styles.tally, className)}>
    <NoticeCounts notices={notices} />
    <div className={styles.tallyCounts}>
      {showTotal && <Count type='publications' count={tally && tally.citingPublications ? tally.citingPublications.toLocaleString() : 0} className={styles.tallyCount} />}
      <Count type='supporting' count={tally && tally.supporting ? tally.supporting.toLocaleString() : 0} className={styles.tallyCount} />
      <Count type='mentioning' count={tally && tally.mentioning ? tally.mentioning.toLocaleString() : 0} className={styles.tallyCount} />
      <Count type='contrasting' count={tally && tally.contradicting ? tally.contradicting.toLocaleString() : 0} className={styles.tallyCount} />
    </div>
    <div className={styles.labels}>
      {showTotal && <span className={styles.label}>Citing Publications</span>}
      <span className={styles.label}>Supporting</span>
      <span className={styles.label}>Mentioning</span>
      <span className={styles.label}>Contrasting</span>
    </div>
  </div>
)

const Link = ({ className, href, children }) => (
  <a className={classNames(styles.link, className)} href={href} target='_blank' rel='noopener noreferrer'>
    {children}
  </a>
)

const Message = ({ className }) => (
  <div className={className}>
    <p>
      See how this article has been cited at <Link href='https://scite.ai'>scite.ai</Link>
    </p>
    <p className={styles.message}>
      scite shows how a scientific paper has been cited by providing the context of the citation, a classification describing whether it supports, mentions, or contrasts the cited claim, and a label indicating in which section the citation was made.
    </p>
  </div>
)

const TooltipContent = ({ tally, notices, showTotal, sciteBaseUrl }) => (
  <div className={styles.tooltipContent}>
    <img className={styles.logo} src='https://cdn.scite.ai/assets/images/logo.svg' />
    <span className={styles.slogan}>Smart Citations</span>

    <Tally tally={tally} notices={notices} showTotal={showTotal} />
    {tally && <a className={styles.button} href={`${sciteBaseUrl}/reports/${tally.doi}`} target='_blank' rel='noopener noreferrer'>View Citations</a>}
    <Message />
  </div>
)

const SectionTallyTooltipContent = ({ tally, sciteBaseUrl }) => (
  <div>
    <img className={styles.logo} src='https://cdn.scite.ai/assets/images/logo.svg' />
    <span className={styles.slogan}>Cited in Sections</span>
    <SectionTally tally={tally} />
    {tally && <a className={styles.button} href={`${sciteBaseUrl}/reports/${tally.doi}`} target='_blank' rel='noopener noreferrer'>View Citations</a>}
    <Message />
  </div>
)

const TooltipPopper = ({
  show,
  doi,
  tally,
  notices,
  placement,
  flip,
  slide,
  handleMouseEnter,
  handleMouseLeave,
  tallyType,
  showTotal,
  sciteBaseUrl
}) => {
  let updatePosition
  // XXX: Hack to fix positioning on first load, sorry
  useEffect(() => {
    if (updatePosition) {
      setTimeout(updatePosition)
    }
  }, [tally])

  const handleClickTooltip = () => {
    window.open(`${sciteBaseUrl}/reports/${doi}`)
  }

  return (
    <Popper
      placement={placement}
      strategy='fixed'
      modifiers={[
        {
          name: 'preventOverflow',
          options: {
            mainAxis: false
          }
        },
        {
          name: 'offset',
          options: {
            offset: [slide || 0, 12]
          }
        },
        {
          name: 'flip',
          options: flip
            ? {}
            : {
                fallbackPlacements: []
              }
        }
      ]}
    >
      {({ ref, style, placement, arrowProps, update }) => {
        updatePosition = update

        return (
          <div
            ref={ref}
            className={
              classNames(styles.tooltip, {
                [styles.tooltipShow]: show
              })
            }
            style={style}
            data-placement={placement}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={handleClickTooltip}
          >
            {tallyType === 'smart_citations' && (<TooltipContent tally={tally} notices={notices} showTotal={showTotal} sciteBaseUrl={sciteBaseUrl} />)}
            {tallyType === 'sections' && (<SectionTallyTooltipContent tally={tally} sciteBaseUrl={sciteBaseUrl} />)}
          </div>
        )
      }}
    </Popper>
  )
}

export const Tooltip = ({
  doi,
  tally,
  notices,
  showZero,
  placement = 'top',
  flip,
  slide = 0,
  children,
  tallyType = 'smart_citations',
  showTotal = true,
  useTestEnv = false
}) => {
  const [showTooltip, setShowTooltip] = useState(false)
  let hideTooltipIntvl
  let showTooltipIntvl

  const sciteBaseUrl = useTestEnv ? 'https://staging.scite.ai' : 'https://scite.ai'

  const handleMouseEnter = () => {
    if (placement === 'none') {
      return
    }

    if (hideTooltipIntvl) {
      clearTimeout(hideTooltipIntvl)
    }
    showTooltipIntvl = setTimeout(() => {
      setShowTooltip(true)
    }, 500)
  }

  const handleMouseLeave = () => {
    if (placement === 'none') {
      return
    }

    if (showTooltipIntvl) {
      clearTimeout(showTooltipIntvl)
    }
    hideTooltipIntvl = setTimeout(() => {
      setShowTooltip(false)
    }, 300)
  }

  if (placement === 'none') {
    return children
  }

  // This is a hack because section tallies don't return citingPublications
  const hasZeroCites = tallyType === 'smart_citations' ? (tally && tally.total === 0 && tally.citingPublications === 0) : tally && tally.total === 0
  return (
    <Manager>
      <Reference>
        {({ ref }) => (
          <div
            className={styles.reference}
            ref={ref}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            {children}
          </div>
        )}
      </Reference>
      <TooltipPopper
        show={showTooltip && !(hasZeroCites && !showZero)}
        doi={doi}
        tally={tally}
        notices={notices}
        placement={placement}
        flip={flip}
        slide={slide}
        handleMouseEnter={handleMouseEnter}
        handleMouseLeave={handleMouseLeave}
        tallyType={tallyType}
        showTotal={showTotal}
        sciteBaseUrl={sciteBaseUrl}
      />
    </Manager>
  )
}
export default Tooltip
