import React from 'react'
import classNames from 'classnames'
import Icon from './Icon'
import styles from '../styles/Count.css'

export const Count = ({ className, horizontal, type, count, showLabels = false, small = false }) => (
  <div
    className={
      classNames(styles.count, className, {
        [styles.horizontal]: horizontal,
        [styles.small]: small
      })
    }
  >
    {showLabels &&
      <span className={classNames(styles.label, {
        [styles.smallLabel]: small
      })}
      >{type}
      </span>}

    <div
      className={
        classNames(styles.iconCountWrapper, {
          [styles.expandedIconCount]: !showLabels
        })
      }
    >
      <Icon type={type} small />
      <span className={classNames(styles.number, {
        [styles.smallNumber]: small
      })}
      >{count}
      </span>
    </div>
  </div>
)

export default Count
