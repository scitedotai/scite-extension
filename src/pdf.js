import * as pdfjs from 'pdfjs-dist'
import * as pdfjsWorker from 'pdfjs-dist/build/pdf.worker.entry'

// set up pdf worker
pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker

const DOI_REGEX = /(10.\d{4,9}\/[-._;()/:A-Z0-9]+)/ig

/**
 * getTitleFromPDF based on adjacent maximum font size lines
 * @param {object} textItems - text items containing text strings and font sizes (height)
 * @returns {object} - Return title and title parts (which are individual lines)
 */
export function getTitleFromPDF (textItems) {
  const text = textItems.map((textItem) => {
    // don't include arxiv side banner (it can be big!)
    if (textItem.str.toLowerCase().includes('arxiv') || textItem.str.toLowerCase().includes('acl anthology')) {
      return { str: '', height: 0 }
    }
    return { str: textItem.str, height: textItem.height }
  })
  // get title by finding the text items with the largest font size
  const maxHeight = text.reduce((acc, textItem) => Math.max(acc, textItem.height), 0)
  const titleParts = text.filter(textItem => textItem.height === maxHeight).map((textItem) => textItem.str)

  // clean title
  let title = titleParts.join(' ')
  title = title.toLowerCase().trim()
  return { title, titleParts }
}

/**
 * getDOIFromPDF based on the herusitic that the DOI is either at the bottom of the page or encoded in the doc
 * @param {object} textItems - text items containing text strings and font sizes (height)
 * @returns {object} - Return title and title parts (which are individual lines)
 */
export function getDOIFromPDF (textItems) {
  let paperDOI = ''

  // loop over all items since last DOI is likely to be the one we want (bottom of the page)
  textItems.forEach((textItem) => {
    const doiMatch = textItem.str.match(DOI_REGEX)
    if (doiMatch) {
      paperDOI = doiMatch[0]
    }
  })
  return paperDOI.toLowerCase().trim()
}

/**
 * getAuthorFromPDF based on the herusitic that the author is after the title
 * @param {object} textItems - text items containing text strings and font sizes (height)
 * @param {Array<string>} titleParts - titleParts containing the title parts (which are individual lines) of text
 * @returns {string} - Return first author surname
 */
export function getAuthorFromPDF (textItems, titleParts) {
  let titleFound = false
  let authorString = ''
  for (const textItem of textItems) {
    // if textItem is empty skip
    if (!textItem.str.trim()) {
      continue
    }

    // if textItem is title, skip and mark as title found
    // so we grab the next non empty textItem
    if (titleParts.includes(textItem.str)) {
      titleFound = true
      continue
    }

    if (!authorString && titleFound) {
      authorString = textItem.str
      break
    }
  }

  // get first author
  let firstAuthor = authorString.split(',')[0]
  // get author surname
  firstAuthor = firstAuthor.split(' ').slice(-1)[0]
  // remove numbers and astrix like for affiliation numbering and email addresses
  firstAuthor = firstAuthor.replace(/[0-9]*\**/g, '')
  // clean first author, title, and doi
  firstAuthor = firstAuthor.toLowerCase().trim()
  return firstAuthor
}

/**
 * parsePDFForTitleandAuthor parses a PDF using pdfjs for title and firstAuthor
 * uses the largest font lines to determine title and then the following line for firstAuthor
 * @param {string} url - url path to the PDF
 * @returns {Promise<object>} - Return title and firstAuthor
 */
export async function parsePDFForTitleandAuthor (url) {
  // load the PDF and get text content and font size (height)
  const pdf = await pdfjs.getDocument(url).promise
  const page = await pdf.getPage(1)
  const textContent = await page.getTextContent()
  const textItems = textContent.items
  const paperDOI = getDOIFromPDF(textItems)
  const { title, titleParts } = getTitleFromPDF(textItems)
  const firstAuthor = getAuthorFromPDF(textItems, titleParts)
  return { title, firstAuthor, doi: paperDOI }
}
