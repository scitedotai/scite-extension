import { h, render } from 'preact'
import Tally from './components/Tally'

const tally = {
  contradicting: 3,
  doi: '10.1016/j.biopsych.2005.08.012',
  mentioning: 146,
  supporting: 20,
  total: 169,
  unclassified: 0
}
const popup = document.querySelector('#scite-popup')

render(<Tally {...tally} />, popup)
