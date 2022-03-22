// TODO: (dom) look into deduplicating common extractors, loops, and styles.
import queryString from 'query-string'
import { matchReference } from './reference-matching'
import { sliceIntoChunks } from './util'

const BADGE_SCRIPT = `
<script async type="application/javascript" src="https://cdn.scite.ai/badge/scite-badge-latest.min.js?v=5">
</script>`

function createBadge (doi) {
  return `<div class="scite-badge scite-extension-badge" data-doi="${doi}" data-layout="horizontal" data-small="true" data-tooltip-placement="none" />`
}

function removeElementsByQuery (query, parentEl = document) {
  const elements = parentEl.querySelectorAll(query)
  for (const element of elements) {
    element.parentNode?.removeChild(element)
  }
}

const DOI_REGEX = /(10.\d{4,9}\/[-._;()/:A-Z0-9]+)/ig

const commonOverlayStyle = `
<style>
.scite-badge {
  display: block !important;
  margin: 0.25rem 0 !important;
  width: max-content !important;
  z-index: 9999999999;
}
</style>
`

const commonStyle = `
    <style>
    .scite-badge {
      display: block !important;
      margin: 0.25rem 0 !important;
      width: max-content !important;
    }
    </style>
`

const commonMinStyle = `
    <style>
    .scite-badge {
      display: block;
      width: min-content;
      margin: 0.25rem 0;
    }
    </style>
`

const xivStyle = `
    <style>
    .scite-badge {
      display: block !important;
      margin: 0.25rem 0 !important;
      width: max-content !important;
    }
    .scite-badge div {
      margin: revert !important;
      padding: 0 0.125rem !important
    }
    </style>
`

const leftMarginStyle = `
<style>
.scite-badge {
  display: block;
  width: min-content;
  margin: 0.5rem 0;
  margin-left: auto;
}
</style>
`

const largeMarginMinStyle = `
<style>
.scite-badge {
  display: block;
  width: min-content;
  margin: 0.5rem 0 !important;
}
</style>
`

/**
 * addRefreshListener adds a click event listener on seeing all references so we can
 * reload badges.
 */
function addRefereshListener (refreshSelector, timeout = 1000) {
  let timeoutID = null
  return () => {
    const showAll = document.body.querySelector(refreshSelector)
    if (showAll) {
      showAll.addEventListener('click', () => {
        removeElementsByQuery('.scite-extension-badge')
        if (timeoutID) {
          clearTimeout(timeoutID)
        }
        timeoutID = setTimeout(() => insertBadges(), timeout)
      })
    }
  }
}

/**
 * addMutationListener adds an attribution mutation listener on specific attributes so we can
 * reload badges.
 */
function addMutationAttributeListener (listenSelectors) {
  let mutationObserverSet = false
  return () => {
    // periodically wait until we have set the mutation listener.
    const interval = setInterval(() => {
      if (mutationObserverSet) {
        clearInterval(interval)
        return
      }

      let observersSet = 0
      for (const selector of listenSelectors) {
        const observer = new window.MutationObserver(function (mutations) {
          mutations.forEach(() => {
            removeElementsByQuery('.scite-extension-badge')
            insertBadges()
          })
        })

        const el = document.querySelector(selector)
        if (!el) {
          continue
        }
        observer.observe(el, {
          attributes: true // configure it to listen to attribute changes
        })
        observersSet += 1
      }
      if (listenSelectors.length === observersSet) {
        mutationObserverSet = true
      }
    }, 1000)
  }
}

function getAnchorDOI (cite) {
  const anchors = cite.querySelectorAll('a')
  for (const anchor of anchors) {
    const doi = anchor?.href?.match(DOI_REGEX)
    if (doi && doi.length > 0) {
      let cleanDOI = decodeURIComponent(doi[0])
      for (const ending of ['/full/html', '/html', '/abstract', '/full', '.pdf', '/pdf']) {
        cleanDOI = cleanDOI.replace(ending, '')
      }
      return cleanDOI
    }
  }
}

/**
 * findPubMedDOIEls looks in cite tags for text beginning with DOI and captures it as a doi
 * @returns {Array<{ citeEl: Element, doi: string}>} - Return
 */
function findPubMedDOIEls () {
  const els = []
  const cites = [...document.body.querySelectorAll('.docsum-content'), ...document.body.querySelectorAll('.references-and-notes-list')]
  for (const cite of cites) {
    const text = cite?.textContent?.match(DOI_REGEX)
    if (text && text.length > 0) {
      els.push({
        citeEl: cite,
        // Pubmed puts a period at the end of their dois for biblographic display reasons.
        // We must slice it.
        doi: text[0].slice(0, -1)
      })
    }
  }
  return els
}

/**
 * findPubMedCentralDOIEls looks in cite tags for text beginning with DOI and captures it as a doi
 * @returns {Array<{ citeEl: Element, doi: string}>} - Return
 */
function findPubMedCentralDOIEls () {
  const els = []
  const cites = document.body.querySelectorAll('.rslt')
  for (const cite of cites) {
    const doiEl = cite.querySelector('.doi')
    try {
      const doi = doiEl?.textContent?.match(DOI_REGEX)
      if (doi && doi.length > 0) {
        els.push({
          citeEl: cite,
          doi: doi[0]
        })
      }
    } catch (e) {
      console.error(e)
    }
  }

  const references = [...document.body.querySelectorAll('.element-citation'), ...document.body.querySelectorAll('.mixed-citation')]
  for (const reference of references) {
    try {
      const text = reference?.textContent?.match(DOI_REGEX)
      if (text && text.length > 0) {
        els.push({
          citeEl: reference,
          // Pubmed puts a period at the end of their dois for biblographic display reasons.
          // We must slice it.
          doi: text[0].slice(0, -1)
        })
      }
    } catch (e) {
      console.error(e)
    }
  }
  return els
}

/**
 * findWikipediaDOIEls looks in cite tags for anchors that link to doi.org and have a doi.
 * @returns {Array<{ citeEl: Element, doi: string}>} - Return
 */
function findWikipediaDOIEls () {
  const els = []
  const cites = document.body.querySelectorAll('cite')
  for (const cite of cites) {
    const anchorDoi = getAnchorDOI(cite)
    if (anchorDoi) {
      els.push({
        citeEl: cite,
        doi: anchorDoi
      })
    }
  }
  return els
}

function getScienceDirectRef (cite) {
  const title = cite.querySelector('.result-list-title-link')?.textContent
  const firstAuthor = cite.querySelector('.author')?.textContent

  if (!title || !firstAuthor) {
    return null
  }

  const firstAuthorSurname = firstAuthor.split(' ').pop()
  return {
    title,
    firstAuthor: firstAuthorSurname
  }
}

/**
 * findScienceDirectDOIs looks in reference tags for anchors that link to doi.org and have a doi.
 * @returns {Array<{ citeEl: Element, doi: string}>} - Return
 */
function findScienceDirectDOIs () {
  const els = []
  const cites = [...document.body.querySelectorAll('.reference'), ...document.body.querySelectorAll('.result-item-content')]
  for (const cite of cites) {
    const anchorDoi = getAnchorDOI(cite)
    if (anchorDoi) {
      els.push({
        citeEl: cite,
        doi: anchorDoi
      })
      continue
    }

    const reference = getScienceDirectRef(cite)
    if (reference) {
      els.push({
        citeEl: cite,
        reference
      })
    }
  }
  return els
}

/**
 * findELifeSciencesDOIs looks in doi tags that link to doi.org.
 * @returns {Array<{ citeEl: Element, doi: string}>} - Return
 */
function findELifeSciencesDOIs () {
  const els = []
  const cites = document.body.querySelectorAll('.doi')
  for (const cite of cites) {
    const anchors = cite.querySelectorAll('a')
    for (const anchor of anchors) {
      const doi = anchor?.href?.match(/doi\.org\/(.+)/)
      if (doi && doi.length > 1) {
        els.push({
          citeEl: cite,
          doi: doi[1]
        })
      }
    }
  }
  return els
}

/**
 * findNatureDOIs looks in reference tags that link to doi.org.
 * @returns {Array<{ citeEl: Element, doi: string}>} - Return
 */
function findNatureDOIs () {
  const els = []
  const cites = [
    ...document.body.querySelectorAll('.c-article-references__item'),
    ...document.body.querySelectorAll('.c-reading-companion__reference-item'),
    ...document.body.querySelectorAll('[itemprop="citation"]'),
    ...document.body.querySelectorAll('.js-ref-item')

  ]
  for (const cite of cites) {
    const anchors = cite.querySelectorAll('a')
    let elementFound = false
    for (const anchor of anchors) {
      const doi = anchor?.href?.match(/doi\.org\/(.+)/)
      if (doi && doi.length > 1) {
        els.push({
          citeEl: cite,
          doi: decodeURIComponent(doi[1])
        })
        elementFound = true
        break
      }
    }
    if (!elementFound) {
      const doi = cite?.textContent?.match(/doi\.org\/(.+)\s/)
      if (doi) {
        els.push({
          citeEl: cite,
          doi: doi[1]
        })
      }
    }
  }
  return els
}

/**
 * findSpringerDOIs looks in reference tags that link to doi.org.
 * @returns {Array<{ citeEl: Element, doi: string}>} - Return
 */
function findSpringerDOIs () {
  const els = []
  const cites = [...document.body.querySelectorAll('.c-article-references__links'), ...document.body.querySelectorAll('.c-reading-companion__reference-item')]
  for (const cite of cites) {
    const anchors = cite.querySelectorAll('a')
    for (const anchor of anchors) {
      const doi = anchor?.href?.match(/doi\.org\/(.+)/)
      if (doi && doi.length > 1) {
        els.push({
          citeEl: cite,
          doi: decodeURIComponent(doi[1])
        })
        break
      }
    }
  }
  return els
}

function getGoogleScholarRef (cite) {
  const title = cite.querySelector('.gs_rt')?.textContent || cite.querySelector('.gsc_a_at')?.textContent
  const authors = cite.querySelector('.gs_a')?.textContent.split('-')[0] || cite.querySelector('.gs_gray')?.textContent

  if (!title || !authors) {
    return null
  }

  const firstAuthor = authors.split(',')[0]
  const firstAuthorSurname = firstAuthor.split(' ').pop()
  return {
    title,
    firstAuthor: firstAuthorSurname
  }
}

function getGoogleAuthor (spans) {
  for (const span of spans) {
    const text = span?.textContent || ''

    if (/^by\s/.test(text)) {
      const byText = text.split('·')[0]
      return byText.replace(/^by\s/, '').trim()
    }
  }
}

function getGoogleRef (cite) {
  const title = cite.querySelector('h3')?.textContent
  const spans = cite.querySelectorAll('span')
  const firstAuthor = getGoogleAuthor(spans)

  if (!title || !firstAuthor) {
    return null
  }

  const firstAuthorSurname = firstAuthor.split(' ').pop()
  return {
    title,
    firstAuthor: firstAuthorSurname
  }
}

/**
 * findGoogleScholarDOIs looks in reference tags that link has doi.
 * @returns {Array<{ citeEl: Element, doi: string}>} - Return
 */
function findGoogleScholarDOIs () {
  const els = []
  const cites = [...document.body.querySelectorAll('.rc'), ...document.body.querySelectorAll('.gs_r'), ...document.body.querySelectorAll('.gsc_a_t')]
  for (const cite of cites) {
    const embeddedDOI = getAnchorDOI(cite)
    if (embeddedDOI) {
      els.push({
        citeEl: cite,
        doi: embeddedDOI
      })
      continue
    }

    const reference = getGoogleScholarRef(cite)
    if (reference) {
      els.push({
        citeEl: cite,
        reference
      })
    }
  }
  return els
}

/**
 * findGoogleDOIs looks in reference tags that link has doi.
 * @returns {Array<{ citeEl: Element, doi: string}>} - Return
 */
function findGoogleDOIs () {
  const els = []
  const cites = document.body.querySelectorAll('.g')

  for (const cite of cites) {
    const embeddedDOI = getAnchorDOI(cite)
    if (embeddedDOI) {
      els.push({
        citeEl: cite,
        doi: embeddedDOI
      })
      continue
    }

    const reference = getGoogleRef(cite)
    if (reference) {
      els.push({
        citeEl: cite,
        reference
      })
    }
  }
  return els
}

/**
 * findPLOSDOIs looks in reference tags that have dois or dataset.doi.
 * @returns {Array<{ citeEl: Element, doi: string}>} - Return
 */
function findPLOSDOIs () {
  const els = []
  let cites = document.body.querySelectorAll('.reflinks')
  for (const cite of cites) {
    els.push({
      citeEl: cite,
      doi: cite.dataset.doi
    })
  }
  cites = document.body.querySelectorAll('dd')
  for (const cite of cites) {
    const anchors = cite.querySelectorAll('a')
    for (const anchor of anchors) {
      const doi = anchor?.href?.match(/10\.(.+)/)
      if (doi && doi.length > 1) {
        els.push({
          citeEl: cite,
          doi: decodeURIComponent(doi[0])
        })
        break
      }
    }
  }
  return els
}

/**
 * findORCIDDOIs looks in reference tags that link to doi.org.
 * @returns {Array<{ citeEl: Element, doi: string}>} - Return
 */
function findORCIDDOIs () {
  const els = []
  const cites = document.body.querySelectorAll('app-panel-data')
  for (const cite of cites) {
    const anchors = cite.querySelectorAll('a')
    for (const anchor of anchors) {
      if (anchor?.href?.match(/doi\.org\/(.+)/) && anchor?.textContent?.match(/10\.(.+)/)) {
        els.push({
          citeEl: cite,
          doi: anchor?.textContent
        })
        break
      }
    }
  }
  return els
}

/**
 * findACSDOIs looks in reference tags that link to doi.org.
 * @returns {Array<{ citeEl: Element, doi: string}>} - Return
 */
function findACSDOIs () {
  const els = []
  let cites = document.body.querySelectorAll('.issue-item')
  for (const cite of cites) {
    const anchors = cite.querySelectorAll('.issue-item_doi')
    for (const anchor of anchors) {
      const doi = anchor?.textContent?.match(/10\.(.+)/)
      if (doi && doi.length > 1) {
        els.push({
          citeEl: cite,
          doi: doi[0]
        })
        break
      }
    }
  }
  cites = document.body.querySelectorAll('a[title="DOI URL"]')
  for (const cite of cites) {
    const doi = cite?.href?.match(/10\.(.+)/)
    if (doi && doi.length > 1) {
      els.push({
        citeEl: cite,
        doi: decodeURIComponent(doi[0])
      })
    }
  }
  return els
}

/**
 * findMDPIDOIs looks in reference tags that link to doi.org.
 * @returns {Array<{ citeEl: Element, doi: string}>} - Return
 */
function findMDPIDOIs () {
  const els = []
  const cites = [...document.body.querySelectorAll('.article-item'), ...document.body.querySelectorAll('.html-x')]
  for (const cite of cites) {
    const anchors = cite.querySelectorAll('a')
    for (const anchor of anchors) {
      const doi = anchor?.href?.match(/doi\.org\/(.+)/)
      if (doi && doi.length > 1) {
        els.push({
          citeEl: cite,
          doi: doi[1]
        })
      }
    }
  }
  return els
}

/**
 * findSageDOIs looks in reference tags that link to doi.org.
 * @returns {Array<{ citeEl: Element, doi: string}>} - Return
 */
function findSageDOIs () {
  const els = []
  let cites = document.body.querySelectorAll("tr[id*='bibr'] td:nth-child(2)")
  for (const cite of cites) {
    const anchors = cite.querySelectorAll('a')
    for (const anchor of anchors) {
      const qs = queryString.parse(anchor.href)
      if (qs && qs.key) {
        els.push({
          citeEl: cite,
          doi: qs.key
        })
      }
    }
  }
  cites = document.body.querySelectorAll('.searchResultItem')
  for (const cite of cites) {
    const anchors = cite.querySelectorAll('a')
    for (const anchor of anchors) {
      let doi = anchor?.href?.match(/doi\/full\/(.+)/)
      if (doi && doi.length > 1) {
        els.push({
          citeEl: cite,
          doi: decodeURIComponent(doi[1])
        })
        break
      }
      doi = anchor?.href?.match(/doi\/pdf\/(.+)/)
      if (doi && doi.length > 1) {
        els.push({
          citeEl: cite,
          doi: decodeURIComponent(doi[1])
        })
        break
      }
    }
  }
  return els
}

/**
 * findTandFDOIs looks in reference tags that link to doi.org.
 * @returns {Array<{ citeEl: Element, doi: string}>} - Return
 */
function findTandFDOIs () {
  const els = []
  let cites = document.body.querySelectorAll('li')
  for (const cite of cites) {
    const anchors = cite.querySelectorAll('a')
    for (const anchor of anchors) {
      const qs = queryString.parse(anchor.href)
      if (qs && qs.key) {
        els.push({
          citeEl: cite,
          doi: qs.key
        })
        break
      }
    }
  }
  cites = document.body.querySelectorAll('.citedByEntry')
  for (const cite of cites) {
    const anchors = cite.querySelectorAll('a')
    for (const anchor of anchors) {
      const doi = anchor?.href?.match(/doi\.org\/(.+)/)
      if (doi && doi.length > 1) {
        els.push({
          citeEl: cite,
          doi: decodeURIComponent(doi[1])
        })
      }
    }
  }
  cites = document.body.querySelectorAll('.searchResultItem')
  for (const cite of cites) {
    const anchors = cite.querySelectorAll('a')
    for (const anchor of anchors) {
      let doi = anchor?.href?.match(/doi\/full\/(.+)/)
      if (doi && doi.length > 1) {
        els.push({
          citeEl: cite,
          doi: decodeURIComponent(doi[1])
        })
        break
      }
      doi = anchor?.href?.match(/doi\/pdf\/(.+)/)
      if (doi && doi.length > 1) {
        els.push({
          citeEl: cite,
          doi: decodeURIComponent(doi[1])
        })
        break
      }
    }
  }
  return els
}

/**
 * findSPIEDOIs looks in reference tags that link to doi.org.
 * @returns {Array<{ citeEl: Element, doi: string}>} - Return
 */
function findSPIEDOIs () {
  const els = []
  let cites = [...document.body.querySelectorAll('.ref-content'), ...document.body.querySelectorAll('.ArticleContentAnchorRow')]
  for (const cite of cites) {
    const anchors = cite.querySelectorAll('a')
    for (const anchor of anchors) {
      const doi = anchor?.href?.match(/doi\.org\/(.+)/)
      if (doi && doi.length > 1) {
        els.push({
          citeEl: cite,
          doi: decodeURIComponent(doi[1])
        })
      }
    }
  }
  cites = document.body.querySelectorAll('.TOCLineItemRow2')
  for (const cite of cites) {
    const anchors = cite.querySelectorAll('a')
    for (const anchor of anchors) {
      const qs = queryString.parse(anchor.href)
      if (qs && qs.DOI) {
        els.push({
          citeEl: cite,
          doi: qs.DOI
        })
      }
    }
  }
  return els
}

/**
 * findSPIEDOIs looks in reference tags that link to doi.org.
 * @returns {Array<{ citeEl: Element, doi: string}>} - Return
 */
function findWileyDOIs () {
  const els = []
  let cites = [...document.body.querySelectorAll('.item__body'), ...document.body.querySelectorAll('.citedByEntry')]
  for (const cite of cites) {
    const anchors = cite.querySelectorAll('a')
    for (const anchor of anchors) {
      const doi = anchor?.href?.match(/doi\/(.+)/)
      if (doi && doi.length > 1) {
        els.push({
          citeEl: cite,
          doi: decodeURIComponent(doi[1])
        })
      }
    }
  }
  cites = document.body.querySelectorAll("li[data-bib-id*='bib']")
  for (const cite of cites) {
    const anchors = cite.querySelectorAll('a')
    for (const anchor of anchors) {
      const qs = queryString.parse(anchor.href)
      if (qs && qs.key) {
        els.push({
          citeEl: cite,
          doi: qs.key
        })
      }
    }
  }
  return els
}

/**
 * findSPIEDOIs looks in reference tags that link to doi.org.
 * @returns {Array<{ citeEl: Element, doi: string}>} - Return
 */
function findKargerDOIs () {
  const els = []
  let cites = document.body.querySelectorAll('.ref')
  for (const cite of cites) {
    const anchors = cite.querySelectorAll('a')
    for (const anchor of anchors) {
      const doi = anchor?.href?.match(/doi\.org\/(.+)/)
      if (doi && doi.length > 1) {
        els.push({
          citeEl: cite,
          doi: decodeURIComponent(doi[1])
        })
        break
      }
    }
  }
  cites = document.body.querySelectorAll('.hit-item-date')
  for (const cite of cites) {
    const text = cite?.textContent?.match(DOI_REGEX)
    if (text && text.length > 0) {
      els.push({
        citeEl: cite,
        doi: text[0]
      })
    }
  }
  return els
}

/**
 * findBioArxivDOIs looks in reference tags that link to doi.org.
 * @returns {Array<{ citeEl: Element, doi: string}>} - Return
 */
function findBioArxivDOIs () {
  const els = []
  let cites = document.body.querySelectorAll('.highwire-cite-metadata-doi')
  for (const cite of cites) {
    const text = cite?.textContent?.match(/doi\.org\/(.+)/)
    if (text && text.length > 0) {
      els.push({
        citeEl: cite,
        doi: text[1]
      })
    }
  }
  cites = document.body.querySelectorAll('.ref-cit')
  for (const cite of cites) {
    const doi = cite.dataset.doi
    if (doi) {
      els.push({
        citeEl: cite,
        doi
      })
    }
  }
  return els
}

/**
 * findScienceDOIs looks in reference tags that link to doi.org.
 * @returns {Array<{ citeEl: Element, doi: string}>} - Return
 */
function findScienceDOIs () {
  const els = []
  const cites = document.body.querySelectorAll('.ref-cit')
  for (const cite of cites) {
    const doi = cite.dataset.doi
    if (doi) {
      els.push({
        citeEl: cite,
        doi
      })
    }
  }
  return els
}

/**
 * findWebOfKnowledgeDOIs looks in reference tags that link to doi.org.
 * @returns {Array<{ citeEl: Element, doi: string}>} - Return
 */
function findWebOfKnowledgeDOIs () {
  const els = []
  const cites = document.body.querySelectorAll('.search-results-content')
  for (const cite of cites) {
    const doi = cite.querySelector("[name='doi']")
    if (doi) {
      els.push({
        citeEl: cite,
        doi: doi?.textContent
      })
    }
  }
  return els
}

/**
 * findScopusDOIs looks in reference tags that link to doi.org.
 * @returns {Array<{ citeEl: Element, doi: string}>} - Return
 */
function findScopusDOIs () {
  const els = []
  let cites = document.body.querySelectorAll('.searchArea')
  for (const cite of cites) {
    const doiEl = cite.querySelector('[data-doi]')
    if (doiEl && doiEl.dataset && doiEl.dataset.doi) {
      els.push({
        citeEl: cite,
        doi: doiEl.dataset.doi
      })
    }
  }
  cites = document.body.querySelectorAll('.refCont')
  for (const cite of cites) {
    const text = cite?.textContent?.match(DOI_REGEX)
    if (text && text.length > 0 && text[0]) {
      els.push({
        citeEl: cite,
        doi: text[0]
      })
    }
  }
  return els
}

/**
 * findEuropePMCDOIs looks in reference tags that link to doi.org.
 * @returns {Array<{ citeEl: Element, doi: string}>} - Return
 */
function findEuropePMCDOIs () {
  const els = []
  const cites = [...document.body.querySelectorAll('.element-citation'), ...document.body.querySelectorAll('.mixed-citation')]
  for (const cite of cites) {
    const anchors = cite.querySelectorAll('a')
    for (const anchor of anchors) {
      const doi = anchor?.href?.match(/doi\.org\/(.+)/)
      if (doi && doi.length > 1) {
        els.push({
          citeEl: cite,
          doi: decodeURIComponent(doi[1])
        })
        break
      }
    }
  }
  return els
}

/**
 * findPNASDOIs looks in reference tags that link to doi.org.
 * @returns {Array<{ citeEl: Element, doi: string}>} - Return
 */
function findPNASDOIs () {
  const els = []
  let cites = document.body.querySelectorAll('.highwire-cite-metadata-doi')
  for (const cite of cites) {
    const text = cite?.textContent?.match(/doi\.org\/(.+)/)
    if (text && text.length > 0) {
      els.push({
        citeEl: cite,
        doi: text[1]
      })
    }
  }
  cites = document.body.querySelectorAll('.ref-cit')
  for (const cite of cites) {
    const doi = cite.dataset.doi
    if (doi) {
      els.push({
        citeEl: cite,
        doi
      })
    }
  }
  return els
}

/**
 * findConnectedPapersDOIs looks in reference tags that link to doi.org.
 * @returns {Array<{ citeEl: Element, doi: string}>} - Return
 */
function findConnectedPapersDOIs () {
  const els = []
  const cites = document.body.querySelectorAll('#open-in-container')
  for (const cite of cites) {
    const anchors = cite.querySelectorAll('a')
    for (const anchor of anchors) {
      if (anchor?.href?.match(/doi\.org\/(.+)/)) {
        els.push({
          citeEl: cite,
          doi: anchor.href.match(/10\..*/)[0]
        })
      }
    }
  }
  return els
}

/**
 * findPeerJDOIs looks in reference tags that link to doi.org.
 * @returns {Array<{ citeEl: Element, doi: string}>} - Return
 */
function findPeerJDOIs () {
  const els = []
  const cites = document.body.querySelectorAll('.citation')
  for (const cite of cites) {
    const anchors = cite.querySelectorAll('a')
    for (const anchor of anchors) {
      const doi = anchor?.href?.match(/10\.(.+)/)
      if (doi) {
        els.push({
          citeEl: cite,
          doi: decodeURIComponent(doi[0])
        })
      }
    }
  }
  return els
}

/**
 * findClinicalTrialsDOIs looks in reference links for doi.org.
 * @returns {Array<{ citeEl: Element, doi: string}>} - Return
 */
function findClinicalTrialsDOIs () {
  const els = []
  const cites = document.body.querySelectorAll('a')
  for (const cite of cites) {
    const doi = cite?.textContent?.match(DOI_REGEX)
    if (doi) {
      els.push({
        citeEl: cite,
        // remove the trailing period
        doi: decodeURIComponent(doi[0]).slice(0, -1)
      })
    }
  }
  return els
}

/**
 * findResearchGatesDOIs looks in reference links to DOI.
 * @returns {Array<{ citeEl: Element, doi: string}>} - Return
 */
function findResearchGateDOIs () {
  const els = []
  const cites = document.body.querySelectorAll('.nova-v-publication-item__meta')
  for (const cite of cites) {
    const spans = cite.querySelectorAll('span')
    for (const span of spans) {
      const doi = span?.textContent?.match(DOI_REGEX)
      if (doi) {
        els.push({
          citeEl: cite,
          doi: decodeURIComponent(doi[0])
        })
      }
    }
  }
  return els
}

/**
 * findLensDOIs looks in reference links to DOI.
 * @returns {Array<{ citeEl: Element, doi: string}>} - Return
 */
function findLensDOIs () {
  const els = []
  const cites = document.body.querySelectorAll('.listing-sidebar')
  for (const cite of cites) {
    const anchors = cite.querySelectorAll('a')
    for (const anchor of anchors) {
      const doi = anchor?.href?.match(DOI_REGEX)
      if (doi) {
        els.push({
          citeEl: cite,
          doi: decodeURIComponent(doi[0])
        })
        break
      }
    }
  }
  return els
}

/**
 * findBMCDOIs looks in reference links to DOI.
 * @returns {Array<{ citeEl: Element, doi: string}>} - Return
 */
function findBMCDOIs () {
  const els = []
  const cites = document.body.querySelectorAll('.c-listing__view-options, .c-reading-companion__reference-links, .c-article-references__links')
  for (const cite of cites) {
    const anchors = cite.querySelectorAll('a')
    for (const anchor of anchors) {
      const doi = decodeURIComponent(anchor?.href).match(DOI_REGEX)
      if (doi) {
        els.push({
          citeEl: cite,
          doi: decodeURIComponent(doi[0])
        })
        break
      }
    }
  }
  return els
}

/**
 * findScieloDOIs looks in reference links to DOI.
 * @returns {Array<{ citeEl: Element, doi: string}>} - Return
 */
function findScieloDOIs () {
  const els = []
  const cites = document.body.querySelectorAll('.metadata')
  for (const cite of cites) {
    const anchors = cite.querySelectorAll('a')
    for (const anchor of anchors) {
      const doi = decodeURIComponent(anchor?.href).match(DOI_REGEX)
      if (doi) {
        els.push({
          citeEl: cite,
          doi: decodeURIComponent(doi[0])
        })
        break
      }
    }
  }
  return els
}

/**
 * findAPADOIs looks in reference links to DOI.
 * @returns {Array<{ citeEl: Element, doi: string}>} - Return
 */
function findAPADOIs () {
  const els = []
  const cites = document.body.querySelectorAll('.resultData, .citText')
  for (const cite of cites) {
    const anchors = cite.querySelectorAll('a')
    for (const anchor of anchors) {
      const doi = decodeURIComponent(anchor?.href).match(DOI_REGEX)
      if (doi) {
        els.push({
          citeEl: cite,
          doi: decodeURIComponent(doi[0])
        })
        break
      }
    }
  }
  return els
}

/**
 * findSemanticScholarDOIs finds references from semantic scholar.
 * @returns {Array<{ citeEl: Element, reference: Object }>} - Return
 */
function findSemanticScholarDOIs () {
  const els = []
  const cites = document.body.querySelectorAll('.cl-paper-row')
  for (const cite of cites) {
    const title = cite.querySelector('.cl-paper-title')?.textContent
    const firstAuthor = cite.querySelector('.cl-paper-authors__author-link')?.textContent?.split(' ').pop()
    if (title && firstAuthor) {
      els.push({
        citeEl: cite,
        reference: {
          title,
          firstAuthor
        }
      })
    }
  }
  return els
}

const BADGE_SITES = [
  {
    name: 'wikipedia.org',
    findDoiEls: findWikipediaDOIEls,
    position: 'afterend',
    style: `
<style>
.scite-badge {
  margin-left: 0.25rem;
}
</style>
`
  },
  {
    name: 'pubmed.ncbi.nlm.nih.gov',
    findDoiEls: findPubMedDOIEls,
    position: 'beforeend',
    initFunc: addRefereshListener('.show-all')
  },
  {
    name: 'ncbi.nlm.nih.gov/pmc',
    findDoiEls: findPubMedCentralDOIEls,
    position: 'beforeend',
    style: `
<style>
.scite-badge {
  display: block;
  width: min-content;
  margin-top: 0.25rem;
}
</style>
`
  },
  {
    name: 'sciencedirect.com',
    findDoiEls: findScienceDirectDOIs,
    position: 'beforeend'
  },
  {
    name: 'elifesciences.org',
    findDoiEls: findELifeSciencesDOIs,
    position: 'afterend',
    style: commonMinStyle
  },
  {
    name: 'nature.com',
    findDoiEls: findNatureDOIs,
    position: 'beforeend',
    style: leftMarginStyle
  },
  {
    name: 'scholar.google',
    findDoiEls: findGoogleScholarDOIs,
    position: 'beforeend',
    style: commonMinStyle
  },
  {
    name: 'google',
    findDoiEls: findGoogleDOIs,
    position: 'beforeend',
    style: commonMinStyle
  },
  {
    name: 'journals.plos.org',
    findDoiEls: findPLOSDOIs,
    position: 'beforeend',
    style: `
    <style>
    .scite-badge {
      display: block;
      width: min-content;
    }
    </style>
`
  },
  {
    name: 'orcid.org',
    findDoiEls: findORCIDDOIs,
    position: 'beforeend',
    style: commonMinStyle
  },
  {
    name: 'pubs.acs.org',
    findDoiEls: findACSDOIs,
    position: 'beforeend',
    style: `
    <style>
    .scite-badge {
      display: block;
      width: max-content;
      margin: 0.5rem 0;
    }
    </style>
`
  },
  {
    name: 'springer.com',
    findDoiEls: findSpringerDOIs,
    position: 'afterend',
    style: leftMarginStyle
  },
  {
    name: 'mdpi.com',
    findDoiEls: findMDPIDOIs,
    position: 'afterend',
    style: largeMarginMinStyle
  },
  {
    name: 'journals.sagepub.com',
    findDoiEls: findSageDOIs,
    position: 'afterend',
    style: largeMarginMinStyle
  },
  {
    name: 'tandfonline.com',
    findDoiEls: findTandFDOIs,
    position: 'beforeend',
    style: commonMinStyle
  },
  {
    name: 'spiedigitallibrary.org',
    findDoiEls: findSPIEDOIs,
    position: 'beforeend',
    style: `
    <style>
    .scite-badge {
      display: inline-block;
      margin-left: 0.25rem;
    }
    </style>
`
  },
  {
    name: 'onlinelibrary.wiley.com',
    findDoiEls: findWileyDOIs,
    position: 'beforeend',
    style: `
    <style>
    .scite-badge {
      display: block;
      margin: 0.25rem 0;
      width: min-content;
    }
    </style>
`
  },
  {
    name: 'karger.com',
    findDoiEls: findKargerDOIs,
    position: 'beforeend',
    style: commonStyle
  },
  {
    name: 'biorxiv.org',
    findDoiEls: findBioArxivDOIs,
    position: 'beforeend',
    style: xivStyle
  },
  {
    name: 'medrxiv.org',
    findDoiEls: findBioArxivDOIs,
    position: 'afterend',
    style: xivStyle
  },
  {
    name: 'sciencemag.org',
    findDoiEls: findScienceDOIs,
    position: 'afterend',
    style: xivStyle
  },
  {
    name: 'webofknowledge',
    findDoiEls: findWebOfKnowledgeDOIs,
    position: 'afterend',
    style: commonStyle
  },
  {
    name: 'scopus',
    findDoiEls: findScopusDOIs,
    position: 'afterend',
    style: commonStyle
  },
  {
    name: 'pnas.org',
    findDoiEls: findPNASDOIs,
    position: 'afterend',
    style: commonStyle
  },
  {
    name: 'europepmc.org',
    findDoiEls: findEuropePMCDOIs,
    position: 'afterend',
    initFunc: addRefereshListener('#free-full-text', 3000),
    style: commonStyle
  },
  {
    name: 'connectedpapers.com',
    findDoiEls: findConnectedPapersDOIs,
    initFunc: addMutationAttributeListener(['.title_link']),
    position: 'afterend',
    style: commonOverlayStyle
  },
  {
    name: 'peerj.com',
    findDoiEls: findPeerJDOIs,
    position: 'afterend',
    style: commonOverlayStyle
  },
  {
    name: 'clinicaltrials.gov',
    findDoiEls: findClinicalTrialsDOIs,
    position: 'afterend',
    style: commonOverlayStyle
  },
  {
    name: 'researchgate.net',
    findDoiEls: findResearchGateDOIs,
    position: 'afterend',
    style: commonOverlayStyle
  },
  {
    name: 'lens.org',
    findDoiEls: findLensDOIs,
    position: 'beforeend',
    initFunc: addRefereshListener('a', 1000),
    style: commonOverlayStyle
  },
  {
    name: 'biomedcentral.com',
    findDoiEls: findBMCDOIs,
    position: 'beforeend',
    style: `
    <style>
    .scite-badge {
      font-weight: normal;
      margin-left: 0.25rem;
    }
    </style>
`
  },
  {
    name: 'scielo.org',
    findDoiEls: findScieloDOIs,
    position: 'afterend',
    style: `
    <style>
    .scite-badge span {
      margin-right: 0 !important;
    }
    </style>
`
  },
  {
    name: 'apa.org',
    findDoiEls: findAPADOIs,
    position: 'afterend',
    style: largeMarginMinStyle
  },
  {
    name: 'semanticscholar.org',
    findDoiEls: findSemanticScholarDOIs,
    position: 'afterend',
    style: largeMarginMinStyle
  }
]

// We don't want badges on these sites.
// Sometimes we need to explicitly exclude them
// so we can remain general to other paths
// and subdomains on the same domain.
const NON_BADGE_SITES = [
  'mail.google'
]

let initFuncSet = false
export default async function insertBadges () {
  // because we are asyncly calling functions we must lock this function to avoid multiple overlapping calls.
  const badgeSite = BADGE_SITES.find(site => window.location.href.includes(site.name))
  const nonBadgeSite = NON_BADGE_SITES.find(site => window.location.href.includes(site))
  if (!badgeSite || nonBadgeSite) {
    return
  }

  const els = badgeSite.findDoiEls()
  if (!els || els.length <= 0) {
    return
  }

  const refsToResolve = []
  for (const el of els) {
    if (el.doi) {
      el.citeEl.insertAdjacentHTML(badgeSite.position, createBadge(el.doi.toLowerCase()?.trim()))
    } else {
      refsToResolve.push(el)
    }
  }

  //
  // Resolve references up to 20 at a time
  //
  const jobs = sliceIntoChunks(refsToResolve, 20)
  for (const batch of jobs) {
    await Promise.all(batch.map(async el => {
      const result = await matchReference(el.reference)
      if (result?.matched) {
        el.citeEl.insertAdjacentHTML(badgeSite.position, createBadge(result.doi.toLowerCase().trim()))
      }
    }))
  }

  // if we have dois then add badge to them.
  // use range and contextual fragment so the script gets executed.
  const range = document.createRange()
  range.setStart(document.documentElement, 0)
  document.documentElement.appendChild(
    range.createContextualFragment(BADGE_SCRIPT)
  )
  if (badgeSite.style) {
    document.documentElement.appendChild(
      range.createContextualFragment(badgeSite.style)
    )
  }

  if (badgeSite.initFunc && !initFuncSet) {
    initFuncSet = true
    badgeSite.initFunc()
  }
}
