import { h, Component } from 'preact'
const { fetch } = window

const rowClasses = type => `scite-icon scite-icon-${type}`

const Row = ({ type, count }) => (
  <div className='scite-tally-row'>
    <i className={rowClasses(type)} />
    <span className='count'>{count}</span>
  </div>
)

class Tally extends Component {
  constructor (props) {
    super(props)

    this.state = {}
    this.openReport = this.openReport.bind(this)
  }

  componentDidMount () {
    this.fetchReport()
  }

  fetchReport (retry = 0, maxRetries = 8) {
    const { doi } = this.props

    const fetchFailed = new Error('Failed to get Tally')

    fetch(`https://api.scite.ai/tallies/${doi}`)
      .then(response => {
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

  openReport () {
    const { doi } = this.props
    window.open(`https://scite.ai/reports/${doi}`)
  }

  render () {
    const { tally } = this.state
    const showClass = tally ? '-show' : ''
    const supporting = tally && tally.supporting || 0
    const contradicting = tally && tally.contradicting || 0
    const mentioning = tally && tally.mentioning || 0

    return (
      <div className={`scite-tally ${showClass}`} onClick={this.openReport}>
        <span className='title'>scite_</span>

        <Row type='supporting' count={supporting} />
        <Row type='mentioning' count={mentioning} />
        <Row type='contradicting' count={contradicting} />
      </div>
    )
  }
}

export default Tally
