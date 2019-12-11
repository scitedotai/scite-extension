import React, { Component } from 'react'
import qs from 'query-string'
import classNames from 'classnames'
import { Manager, Reference, Popper } from 'react-popper'
const { fetch } = window

const iconClasses = type => `scite-icon scite-icon-${type}`

const Count = ({ horizontal, type, count }) => (
  <div
    className={
      classNames('scite-tally-count', {
        '-horizontal': horizontal
      })
    }
  >
    <i className={iconClasses(type)} />
    <span className='number'>{count}</span>
  </div>
)

const TooltipTally = ({ className, tally }) => (
  <div className={classNames('scite-tooltip-tally', className)}>
    <div className='tally'>
      <Count type='supporting' count={tally ? tally.supporting : 0} />
      <Count type='mentioning' count={tally ? tally.mentioning : 0} />
      <Count type='contradicting' count={tally ? tally.contradicting : 0} />
    </div>
    <div className='scite-tally-labels labels'>
      <span className='label'>Supporting</span>
      <span className='label'>Mentioning</span>
      <span className='label'>Contradicting</span>
    </div>
  </div>
)

const TooltipMessage = ({ className }) => (
  <div className={classNames('scite-tooltip-message', className)}>
    <p>
      scite is a platform that combines deep learning with expert
      analysis to automatically classify citations as supporting,
      contradicting or mentioning.
    </p>
  </div>
)

const TooltipContent = ({ tally }) => (
  <div className='scite-tooltip-content'>
    <span className='scite-title'>scite_</span>
    <span className='slogan'>Making Science Reliable</span>

    <TooltipTally tally={tally} />
    {tally && <a className='scite-button button' href={`https://scite.ai/reports/${tally.doi}`} target='_blank'>View Citations</a>}
    <TooltipMessage className='message' />
  </div>
)

class Tally extends Component {
  constructor (props) {
    super(props)

    this.state = {
      tally: null,
      showTooltip: false
    }
    this.handleClick = this.handleClick.bind(this)
    this.handleMouseEnter = this.handleMouseEnter.bind(this)
    this.handleMouseLeave = this.handleMouseLeave.bind(this)
    this.fetchReport = this.fetchReport.bind(this)
  }

  componentDidMount () {
    this.fetchReport()
  }

  handleMouseEnter () {
    if (this.hideTooltipIntvl) {
      clearTimeout(this.hideTooltipIntvl)
    }
    this.setState({
      showTooltip: true
    })
  }

  handleMouseLeave () {
    this.hideTooltipIntvl = setTimeout(() => {
      this.setState({
        showTooltip: false
      })
    }, 300)
  }

  fetchReport (retry = 0, maxRetries = 8) {
    const { doi } = this.props

    const fetchFailed = new Error('Failed to get Tally')

    fetch(`https://api.scite.ai/tallies/${doi}`)
      .then(response => {
        if (response.status === 404) {
          // Then we will set a 0 tally
          this.setState({
            tally: {
              doi,
              total: 0
            }
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
          this.setState({ tally })
        }
      })
      .catch(e => {
        if (e === fetchFailed && retry < maxRetries) {
          return setTimeout(() => this.fetchReport(++retry, maxRetries), 1200)
        }

        console.error(e)
      })
  }

  get queryString () {
    const { source, isBadge, campaign } = this.props

    const params = {
      utm_medium: isBadge ? 'badge' : 'plugin',
      utm_source: source || 'generic',
      utm_campaign: campaign || 'badge_generic'
    }

    return qs.stringify(params)
  }

  handleClick () {
    const { doi } = this.props
    window.open(`https://scite.ai/reports/${doi}?${this.queryString}`)
  }

  render () {
    const { horizontal, showZero } = this.props
    const { tally, showTooltip } = this.state
    const classes = {
      tally: classNames('scite-tally', {
        '-horizontal': horizontal,
        '-show': showZero ? tally : tally && tally.total > 0
      }),
      tooltip: classNames('scite-tooltip', {
        '-show': showTooltip
      })
    }
    const supporting = (tally && tally.supporting) || 0
    const contradicting = (tally && tally.contradicting) || 0
    const mentioning = (tally && tally.mentioning) || 0

    return (
      <Manager>
        <Reference>
          {({ ref }) => (
            <div
              className={classes.tally}
              onClick={this.handleClick}
              onMouseEnter={this.handleMouseEnter}
              onMouseLeave={this.handleMouseLeave}
              ref={ref}
            >
              {!horizontal && <span className='scite-title title'>scite_</span>}

              <Count type='supporting' count={supporting} horizontal={horizontal} />
              <Count type='mentioning' count={mentioning} horizontal={horizontal} />
              <Count type='contradicting' count={contradicting} horizontal={horizontal} />
            </div>
          )}
        </Reference>

        <Popper placement='top'>
          {({ ref, style, placement, arrowProps }) => (
            <div className={classes.tooltip} ref={ref} style={style} data-placement={placement} onMouseEnter={this.handleMouseEnter} onMouseLeave={this.handleMouseLeave}>
              <TooltipContent tally={tally} />
              <div className='scite-tooltip-arrow' ref={arrowProps.ref} style={arrowProps.style} />
            </div>
          )}
        </Popper>
      </Manager>
    )
  }
}

Tally.defaultProps = {
  horizontal: false,
  isBadge: false,
  showZero: true
}

export default Tally
