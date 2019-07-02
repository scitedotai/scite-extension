import { h } from 'preact'

const rowClasses = type => `scite-icon scite-icon-${type}`

const Row = ({ type, count }) => (
  <div className='scite-tally-row'>
    <i className={rowClasses(type)} />
    <span className='count'>{count}</span>
  </div>
)

const Tally = ({ doi, total, supporting, contradicting, mentioning }) => (
  <div className='scite-tally'>
    <span className='title'>scite_</span>

    <Row type='supporting' count={supporting} />
    <Row type='contradicting' count={contradicting} />
    <Row type='mentioning' count={mentioning} />
  </div>
)

export default Tally
