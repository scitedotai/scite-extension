import React from 'react'

const scaleBarHeight = ({
  height,
  chartHeight,
  largestValue
}) => {
  return (height / largestValue) * chartHeight
}

const BarGroup = ({
  col,
  barWidth,
  chartHeight,
  largestValue
}) => {
  const barPadding = 2

  const height = scaleBarHeight({
    height: col.value,
    chartHeight,
    largestValue
  })

  return (
    <g transform={`translate(0, ${chartHeight - height})`}>
      <rect width={barWidth - barPadding} height={height} fill={col.color} />
    </g>
  )
}

const BarChart = ({ chartWidth, chartHeight, data }) => {
  const barWidth = 30
  const largestValue = Math.max.apply(Math, data.map(o => o.value))
  const barGroups = data.map((col, i) => (
    <g key={`bar_${i}`} transform={`translate(${i * barWidth},0)`}>
      <BarGroup col={col} barWidth={barWidth} chartHeight={chartHeight} largestValue={largestValue} />
    </g>
  ))

  const xAdjustment = (chartWidth - (barWidth * data.length)) / 2
  return (
    <svg width={chartWidth} height={chartHeight} style={{ marginRight: '25px' }}>
      <g>
        <g transform={`translate(${xAdjustment}, 0)`}>
          {barGroups}
        </g>
      </g>
    </svg>
  )
}

export default BarChart
