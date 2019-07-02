import { h, Component } from 'preact'
import Tally from './Tally'

const { fetch } = window

class Popup extends Component {
  constructor (props) {
    super(props)

    this.state = {}
    this.openReport = this.openReport.bind(this)
  }

  componentDidMount () {
    const { doi } = this.props

    fetch('https://api.scite.ai/tallies/' + doi)
      .then(response => response.json())
      .then(tally => {
        this.setState({ tally })
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

    return (
      <div className='scite-popup' onClick={this.openReport}>
        {tally && <Tally {...tally} />}
      </div>
    )
  }
}

export default Popup
