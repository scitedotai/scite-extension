import React from 'react'

// Degrees to radians
const d2r = d => d * (Math.PI / 180)

// Radians to degrees
const r2d = r => r / (Math.PI / 180)

/**
 * Given desired arc length and radius, returns the angle in radians
 *    of the arc
 * arcLength = radius x angleInRadians
 */
const angleForArcLength = (arcLength, arcRadius) => arcLength / arcRadius

const _generateChartConfig = ({ size }) => {
  // Center of viewbox
  const center = size / 2

  // Inner hole diameter
  const innerHoleDiameter = 75

  // Segment thickness
  const thickness = (size - innerHoleDiameter) / 2

  // Outer radius
  const radiusOuter = size / 2

  // Inner radius
  const radiusInner = radiusOuter - thickness

  // Spacing between segments
  const gapSize = 1

  // Angle offset for gaps at inner edge
  const gapAngleOffsetInner = r2d(angleForArcLength(gapSize, radiusInner))

  // Angle offset for gaps at outer edge
  const gapAngleOffsetOuter = r2d(angleForArcLength(gapSize, radiusOuter))

  const minimumAngleDeg = r2d(angleForArcLength(gapSize * 2, radiusInner))

  const minimumValue = minimumAngleDeg / 360

  return {
    center,
    innerHoleDiameter,
    thickness,
    radiusOuter,
    radiusInner,
    gapSize,
    gapAngleOffsetInner,
    gapAngleOffsetOuter,
    minimumAngleDeg,
    minimumValue
  }
}

/**
 * Computes an x/y coordinate for the given angle and radius
 * @param {number} deg - The angle in degrees
 * @param {number} r  - The radius
 * @returns {Array} - An x/y coordinate for the point at the given angle and radius
 */
const coords = (deg, r, center) => {
  const rad = d2r(deg)

  return [center - Math.cos(rad) * r, center - Math.sin(rad) * r]
}

const makeSegment = ({ chartConfig, paths, subtotal }, { percent, color }, i) => {
  const startAngle = subtotal * 360 + 90 // +90 so we start at 12 o'clock
  const endAngle = startAngle + percent * 360

  // no gaps for values beneath the minimum threshold
  const useGap = percent >= chartConfig.minimumValue
  const innerGap = useGap ? chartConfig.gapAngleOffsetInner : 0
  const outerGap = useGap ? chartConfig.gapAngleOffsetOuter : 0

  const startAngleInner = startAngle + innerGap
  const startAngleOuter = startAngle + outerGap
  const endAngleInner = endAngle - innerGap
  const endAngleOuter = endAngle - outerGap

  const [x1, y1] = coords(startAngleInner, chartConfig.radiusInner, chartConfig.center) // start point on inner circle
  const [x2, y2] = coords(startAngleOuter, chartConfig.radiusOuter, chartConfig.center) // start point on outer circle
  const [x3, y3] = coords(endAngleOuter, chartConfig.radiusOuter, chartConfig.center) // end point on outer circle
  const [x4, y4] = coords(endAngleInner, chartConfig.radiusInner, chartConfig.center) // end point on inner circle

  const largeArc = percent > 0.5 ? 1 : 0
  const sweepOuter = 1
  const sweepInner = 0

  // Thank you to internet stranger for helping with path building
  const commands = [
      // move to start angle coordinate, inner radius
      `M${x1} ${y1}`,

      // line to start angle coordinate, outer radius
      `L${x2} ${y2}`,

      // arc to end angle coordinate, outer radius
      `A${chartConfig.radiusOuter} ${chartConfig.radiusOuter} 0 ${largeArc} ${sweepOuter} ${x3} ${y3}`,

      // line to end angle coordinate, inner radius
      `L${x4} ${y4}`,

      // arc back to start angle coordinate, inner radius
      `A${chartConfig.radiusInner} ${chartConfig.radiusInner} 0 ${largeArc} ${sweepInner} ${x1} ${y1}`
  ]

  const fillProp = color ? { fill: color } : {}

  paths.push(
    <path
      key={i}
      {...fillProp}
      stroke='none'
      d={commands.join(' ')}
    />
  )

  return {
    chartConfig,
    paths,
    subtotal: subtotal + percent
  }
}

const computePercentages = ({ data }) => {
  const filtered = (data || []).filter(({ value }) => value > 0)
  const total = filtered.reduce((t, { value = 0 }) => t + value, 0)

  return filtered.map(item => ({
    ...item,
    percent: item.value / total
  }))
}

const DonutChart = ({ data, size }) => {
  const items = computePercentages({ data })

  if (!(items || []).length) {
    return null
  }

  const chartConfig = _generateChartConfig({ size })
  const paths = items.reduce(makeSegment, { chartConfig, paths: [], subtotal: 0 }).paths
  return (
    <div>
      <div>
        <svg width={size} height={size} style={{ marginRight: '25px' }}>
          {paths}
        </svg>
      </div>
    </div>
  )
}

export default DonutChart
