import { h, Component } from 'preact'
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
    this.setState({
      showTooltip: true
    })
  }

  handleMouseLeave () {
    this.setState({
      showTooltip: false
    })
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
        <div>
          <Reference>
            {({ ref }) => (
              <div
                className={classes.tally}
                onClick={this.handleClick}
                onMouseEnter={this.handleMouseEnter}
                onMouseLeave={this.handleMouseLeave}
                ref={ref}
              >
                {!horizontal && <span className='title'>scite_</span>}

                <Count type='supporting' count={supporting} horizontal={horizontal} />
                <Count type='mentioning' count={mentioning} horizontal={horizontal} />
                <Count type='contradicting' count={contradicting} horizontal={horizontal} />
              </div>
            )}
          </Reference>

          <Popper placement='top'>
            {({ ref, style, placement, arrowProps }) => (
              <div className={classes.tooltip} ref={ref} style={style} data-placement={placement}>
                Popper element
                <div className='scite-tooltip-arrow' ref={arrowProps.ref} style={arrowProps.style} />
              </div>
            )}
          </Popper>
        </div>
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
