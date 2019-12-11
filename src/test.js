import React from 'react'
import { render } from 'react-dom'
import Tally from './components/Tally'

const doi = '10.1016/j.biopsych.2005.08.012'
const popup = document.querySelector('#scite-popup-app')

render(<Tally doi={doi} />, popup)
