import React from 'react'
import classNames from 'classnames'
import Icon from './Icon'
import styles from '../styles/Count.css'

export const Count = ({ className, horizontal, type, count, showLabels = false, small = false, verticalCompact = false }) => (
  <div
    className={
      classNames(styles.count, className, {
        [styles.horizontal]: horizontal,
        [styles.small]: small,
        [styles.verticalContainer]: verticalCompact
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
          [styles.expandedIconCount]: !showLabels,
          [styles.vertical]: verticalCompact
        })
      }
    >
      {!verticalCompact && (
        <>
          <Icon type={type} small />
          <span className={classNames(styles.number, {
            [styles.smallNumber]: small
          })}
          >{count}
          </span>
        </>
      )}

      {verticalCompact && (
        <div className={styles.countContainer}>
          <div className={styles.iconContainer}>
            <Icon type={type} isVerticalCompact={verticalCompact} />
          </div>

          <div className={styles.numberContainer}>
            <span className={classNames(styles.number, styles.largeNumber,
              {
                [styles.number1k]: Number(count.replaceAll(',', '')) > 1000,
                [styles.number10k]: Number(count.replaceAll(',', '')) > 10000,
                [styles.number100k]: Number(count.replaceAll(',', '')) > 100000,
                [styles.number1m]: Number(count.replaceAll(',', '')) > 1000000
              }
            )}
            >
              {count}
            </span>
          </div>
        </div>
      )}
    </div>
  </div>
)

export default Count
