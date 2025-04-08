import React from 'react'
import classNames from 'classnames'
import styles from '../styles/Icon.css'

export const Icon = ({ type, small = false, isVerticalCompact = false }) => (
  <i className={classNames(styles.icon, styles[type], {
    [styles.smallIcon]: small,
    [styles.largeIcon]: isVerticalCompact
  })}
  />
)

export default Icon
