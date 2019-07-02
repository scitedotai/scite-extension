import { h, render } from 'preact'
import Popup from './components/Popup'

const doi = '10.1016/j.biopsych.2005.08.012'
const popup = document.querySelector('#scite-popup-app')

render(<Popup doi={doi} />, popup)
