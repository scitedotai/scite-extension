import { h, Component } from 'preact'
import qs from 'query-string'
import classNames from 'classnames'
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
      tally: null
    }
    this.handleClick = this.handleClick.bind(this)
  }

  componentDidMount () {
    this.fetchReport()
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
    const { horizontal } = this.props
    const { tally } = this.state
    const classes = classNames('scite-tally', {
      '-horizontal': horizontal,
      '-show': tally
    })
    const supporting = (tally && tally.supporting) || 0
    const contradicting = (tally && tally.contradicting) || 0
    const mentioning = (tally && tally.mentioning) || 0

    return (
      <div className={classes} onClick={this.handleClick}>
        {!horizontal && <span className='title'>scite_</span>}

        <Count type='supporting' count={supporting} horizontal={horizontal} />
        <Count type='mentioning' count={mentioning} horizontal={horizontal} />
        <Count type='contradicting' count={contradicting} horizontal={horizontal} />
      </div>
    )
  }
}

Tally.defaultProps = {
  horizontal: false,
  isBadge: false
}

export default Tally
