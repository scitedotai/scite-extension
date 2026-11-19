/* eslint-env jest */
import React from 'react'
import { render, unmountComponentAtNode } from 'react-dom'
import { act } from 'react-dom/test-utils'
import Tooltip from '../Tooltip'
import SectionTally from '../SectionTally'

const tally = { doi: '10.1/x', total: 5, introduction: 1, methods: 1, results: 1, discussion: 1, other: 1 }

let container
beforeEach(() => {
  container = document.createElement('div')
  document.body.appendChild(container)
})
afterEach(() => {
  unmountComponentAtNode(container)
  container.remove()
})

// The badge is a role=button, so anything focusable inside it is a nested
// interactive control (axe nested-interactive, WCAG A). The report stays one
// click away: the badge itself and the pop-up's View Citations link open it.
it.each([null, 'bar', 'pie', 'donut'])('section badge (chart: %s) has nothing focusable inside its button', chartType => {
  act(() => {
    render(
      <Tooltip doi='10.1/x' tally={tally} tallyType='sections'>
        <SectionTally tally={tally} isBadge chartType={chartType} />
      </Tooltip>,
      container
    )
  })
  const badge = container.querySelector('[role="button"]')
  expect(badge).not.toBeNull()
  expect(badge.querySelectorAll('a, button, input, select, textarea, [tabindex]')).toHaveLength(0)
})
