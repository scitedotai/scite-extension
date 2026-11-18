/* eslint-env jest */
import React from 'react'
import { render, unmountComponentAtNode } from 'react-dom'
import { act, Simulate } from 'react-dom/test-utils'
import Tooltip from '../Tooltip'

const tally = { doi: '10.1/x', total: 3, citingPublications: 3, supporting: 1, mentioning: 2, contradicting: 0 }

let container
beforeEach(() => {
  container = document.createElement('div')
  document.body.appendChild(container)
  act(() => {
    render(<Tooltip doi='10.1/x' tally={tally}><span>badge</span></Tooltip>, container)
  })
})
afterEach(() => {
  unmountComponentAtNode(container)
  container.remove()
})

const badge = () => container.querySelector('[role="button"]')
const popup = () => document.getElementById(badge().getAttribute('aria-controls'))
const key = (el, k) => act(() => { Simulate.keyDown(el, { key: k }) })

it('badge is a focusable button whose expanded state tracks the tooltip', () => {
  expect(badge().getAttribute('tabindex')).toBe('0')
  expect(badge().getAttribute('aria-expanded')).toBe('false')
  expect(popup().className).not.toContain('tooltipShow')

  key(badge(), 'Enter')
  expect(badge().getAttribute('aria-expanded')).toBe('true')
  expect(popup().className).toContain('tooltipShow')

  key(badge(), ' ')
  expect(badge().getAttribute('aria-expanded')).toBe('false')
})

it('Escape inside the tooltip closes it and returns focus to the badge', () => {
  key(badge(), 'Enter')
  key(popup(), 'Escape')
  expect(badge().getAttribute('aria-expanded')).toBe('false')
  expect(document.activeElement).toBe(badge())
})

it('closes when focus leaves the badge and tooltip, but not when moving into the tooltip', () => {
  key(badge(), 'Enter')
  const link = popup().querySelector('a')
  act(() => { Simulate.blur(badge(), { relatedTarget: link }) })
  expect(badge().getAttribute('aria-expanded')).toBe('true')

  act(() => { Simulate.blur(link, { relatedTarget: document.body }) })
  expect(badge().getAttribute('aria-expanded')).toBe('false')
})

it('Escape cancels a pending hover-open', () => {
  jest.useFakeTimers()
  act(() => { Simulate.mouseEnter(badge()) })
  key(badge(), 'Enter')
  key(badge(), 'Escape')
  act(() => { jest.advanceTimersByTime(1000) })
  expect(badge().getAttribute('aria-expanded')).toBe('false')
  jest.useRealTimers()
})

it('Enter on a link nested in the badge is left alone', () => {
  const link = document.createElement('a')
  badge().appendChild(link)
  act(() => { link.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Enter', bubbles: true })) })
  expect(badge().getAttribute('aria-expanded')).toBe('false')
})

it('a screen reader click (detail 0) toggles, a mouse click does not', () => {
  act(() => { Simulate.click(badge(), { detail: 1 }) })
  expect(badge().getAttribute('aria-expanded')).toBe('false')
  act(() => { Simulate.click(badge(), { detail: 0 }) })
  expect(badge().getAttribute('aria-expanded')).toBe('true')
})

it('mouse leaving does not close the tooltip while focus is inside it', () => {
  jest.useFakeTimers()
  key(badge(), 'Enter')
  popup().querySelector('a').focus()
  act(() => { Simulate.mouseLeave(popup()) })
  act(() => { jest.advanceTimersByTime(1000) })
  expect(badge().getAttribute('aria-expanded')).toBe('true')
  jest.useRealTimers()
})
