import React from 'react'
import { render } from 'react-dom'
import { Tally } from 'scite-widget'
import './styles/index.css'
import 'scite-widget/lib/main.css'

const doi = '10.1016/j.biopsych.2005.08.012'
const popup = document.querySelector('#scite-popup-app')

render(<Tally doi={doi} />, popup)
