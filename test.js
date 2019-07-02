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

const Tally = ({ doi, total, supporting, contradicting, mentioning }) => (
  <div>
    <div>DOI: {doi}</div>
    <div>Total: {total}</div>
  </div>
)

render(<Tally {...tally} />, popup)
