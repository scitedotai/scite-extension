/* eslint-env jest */

// test getAuthorFromPDF

import { getAuthorFromPDF, getTitleFromPDF, getDOIFromPDF } from '../pdf'

describe('getTitleFromPDF', () => {
  it('should return title and titleParts', () => {
    const title = 'mushrooms are the best'
    const textItems = [
      {
        str: 'MUSHROOMS ARE',
        height: 100
      },
      {
        str: 'THE BEST',
        height: 100
      },
      {
        str: '',
        height: 10
      },
      {
        str: 'Luigi Mario',
        height: 10
      },
      {
        str: '10.1038/s41598-018-06657-0',
        height: 1
      }
    ]
    const titleParts = ['MUSHROOMS ARE', 'THE BEST']
    expect(getTitleFromPDF(textItems)).toEqual({ title, titleParts })
  })
})

describe('getDOIFromPDF', () => {
  it('should return doi', () => {
    const doi = '10.1038/s41598-018-06657-0'
    const textItems = [
      {
        str: 'MUSHROOMS ARE',
        height: 100
      },
      {
        str: 'THE BEST',
        height: 100
      },
      {
        str: '10.1038/s41598-018-06657-0',
        height: 1
      }
    ]
    expect(getDOIFromPDF(textItems)).toEqual(doi)
  })
})

describe('getAuthorFromPDF', () => {
  it('should return first author surname after the title', () => {
    const firstAuthor = 'mario'
    const textItems = [
      {
        str: 'MUSHROOMS ARE',
        height: 100
      },
      {
        str: 'THE BEST',
        height: 100
      },
      {
        str: '',
        height: 10
      },
      {
        str: 'Luigi Mario',
        height: 10
      }
    ]
    const titleParts = ['MUSHROOMS ARE', 'THE BEST']
    expect(getAuthorFromPDF(textItems, titleParts)).toEqual(firstAuthor)
  })
})
