import { h, Component } from 'preact'
import Tally from './Tally'

const { fetch } = window

class Popup extends Component {
  constructor (props) {
    super(props)

    this.state = {}
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

  render () {
    const { tally } = this.state

    return (
      <div className='scite-popup'>
        {tally && <Tally {...tally} />}
      </div>
    )
  }
}

export default Popup
