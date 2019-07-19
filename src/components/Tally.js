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
    const { doi } = this.props

    fetch(`https://api.scite.ai/tallies/${doi}`)
      .then(response => response.json())
      .then(tally => {
        if (typeof tally.total === 'number') {
          this.setState({ tally })
        }
      })
      .catch(e => {
        console.error(e)
      })
  }

  openReport () {
    const { doi } = this.props
    window.open(`https://scite.ai/reports/${doi}`)
  }

  render () {
    const { tally } = this.state

    if (!tally) {
      return null
    }

    return (
      <div className='scite-tally' onClick={this.openReport}>
        <span className='title'>scite_</span>

        <Row type='supporting' count={tally.supporting} />
        <Row type='contradicting' count={tally.contradicting} />
        <Row type='mentioning' count={tally.mentioning} />
      </div>
    )
  }
}

export default Tally
