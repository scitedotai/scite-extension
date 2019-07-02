import { h, render } from 'preact'

const tally = {
  contradicting: 3,
  doi: '10.1016/j.biopsych.2005.08.012',
  mentioning: 146,
  supporting: 20,
  total: 169,
  unclassified: 0
}
const popup = document.querySelector('#scite-popup')

const Row = ({ type, count }) => (
  <div className='scite-tally-row'>
    <span className='type'>{type}</span>
    <span className='count'>{count}</span>
  </div>
)

const Tally = ({ doi, total, supporting, contradicting, mentioning }) => (
  <div className='scite-tally'>
    <span className='title'>Scite Summary</span>

    <Row type='supporting' count={supporting} />
    <Row type='contradicting' count={contradicting} />
    <Row type='mentioning' count={mentioning} />
  </div>
)

render(<Tally {...tally} />, popup)
