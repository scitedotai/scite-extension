import React from 'react'

const calcPieChartSectionPercentage = ({
  value,
  total
}) => {
  return (value / total)
}

const getCoordinatesForPercent = (percent) => {
  const x = Math.cos(2 * Math.PI * percent)
  const y = Math.sin(2 * Math.PI * percent)

  return [x, y]
}

const mapDataToSlicePercentages = ({
  data,
  total
}) => {
  return data.map((d) => {
    return {
      color: d.color,
      percent: calcPieChartSectionPercentage({
        value: d.value,
        total
      })
    }
  })
}

const generateSectionPaths = (slicesWithPercentages) => {
  /**
     * This uses paths to draw the pie chart instead of stroke-dasharray for maximum
     * browser compatibility.
     * God bless this man: https://medium.com/hackernoon/a-simple-pie-chart-in-svg-dbdd653b6936
     */
  let cumulativePercent = 0
  const pathsArr = []

  slicesWithPercentages.forEach(slice => {
    const [startX, startY] = getCoordinatesForPercent(cumulativePercent)

    cumulativePercent += slice.percent

    const [endX, endY] = getCoordinatesForPercent(cumulativePercent)

    const largeArcFlag = slice.percent > 0.5 ? 1 : 0

    const pathData = [
        `M ${startX} ${startY}`, // Move
        `A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`, // Arc
        'L 0 0' // Line
    ].join(' ')

    pathsArr.push(
      <path d={pathData} fill={slice.color} />
    )
  })
  return pathsArr
}

const PieChart = ({ chartWidth, chartHeight, data }) => {
  const total = data.reduce((n, { value }) => n + value, 0)

  const slicesWithPercentages = mapDataToSlicePercentages({ data, total })

  const sections = generateSectionPaths(slicesWithPercentages)

  return (
    <svg width={chartWidth} height={chartHeight} viewBox='-1 -1 2 2' style={{ marginRight: '25px' }}>
      {sections}
    </svg>
  )
}

export default PieChart
