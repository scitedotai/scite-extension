export const generateChartDataFromSectionTally = (tally = {}) => {
  return [
    {
      name: 'Intro',
      color: '#002AB2',
      value: tally.introduction || 0
    },
    {
      name: 'Methods',
      color: '#0036E5',
      value: tally.methods || 0
    },
    {
      name: 'Results',
      color: '#0062FF',
      value: tally.results || 0
    },
    {
      name: 'Discussion',
      color: '#66A3FF',
      value: tally.discussion || 0
    },
    {
      name: 'Other',
      color: '#9EC4F0',
      value: tally.other || 0
    }
  ]
}

export const renderSectionType = (type) => {
  if (type === 'introduction') {
    return 'Intro'
  }
  return type
}

export const CHART_TYPES = {
  PIE: 'pie',
  BAR: 'bar',
  DONUT: 'donut'
}
