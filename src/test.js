import { h, render } from 'preact'
import { Tally, TallyLoader } from 'scite-widget'

const doi = '10.1016/j.biopsych.2005.08.012'
const popup = document.querySelector('#scite-popup-app')

render(
  (
    <TallyLoader doi={doi}>
      {({ tally }) => (
        <Tally tally={tally} />
      )}
    </TallyLoader>
  ),
  popup
)
