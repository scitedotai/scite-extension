// TODO: (dom) look into deduplicating common extractors and loops.
const queryString = require('query-string')

const BADGE_SCRIPT = `
<script async type="application/javascript" src="https://cdn.scite.ai/badge/scite-badge-latest.min.js?v=2">
</script>`

function createBadge (doi) {
  return `<div class="scite-badge" data-doi="${doi}" data-layout="horizontal" data-small="true"/>`
}

function removeElementsByClass (className) {
  const elements = document.getElementsByClassName(className)
  while (elements.length > 0) {
    elements[0].parentNode.removeChild(elements[0])
  }
}

const DOI_REGEX = /(10.\d{4,9}\/[-._;()/:A-Z0-9]+)/ig

/**
 * addRefreshListener adds a click event listener on seeing all references so we can
 * reload badges.
 */
function addRefereshListener (refreshSelector, timeout = 1000) {
  return () => {
    const showAll = document.body.querySelector(refreshSelector)
    if (showAll) {
      showAll.addEventListener('click', () => {
        removeElementsByClass('scite-badge')
        setTimeout(() => insertBadges(), timeout)
      })
    }
  }
}

/**
 * addMutationListener adds an attribution mutation listener on specific attributes so we can
 * reload badges.
 */
let mutationObserverSet = false
function addMutationAttributeListener (listenSelectors) {
  return () => {
    if (mutationObserverSet) {
      return
    }
    for (const selector of listenSelectors) {
      const observer = new MutationObserver(function (mutations) {
        mutations.forEach(() => {
          removeElementsByClass('scite-badge')
          insertBadges()
        })
      })

      observer.observe(document.querySelector(selector), {
        attributes: true // configure it to listen to attribute changes
      })
    }
    mutationObserverSet = true
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
 * findPubMedDOIEls looks in cite tags for text beginning with DOI and captures it as a doi
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
    const anchors = cite.querySelectorAll('a')
    for (const anchor of anchors) {
      if (anchor?.href?.match(/doi\.org\/(.+)/) && anchor?.textContent?.match(/10\.(.+)/)) {
        els.push({
          citeEl: cite,
          doi: anchor.textContent
        })
      }
    }
  }
  return els
}

/**
 * findScienceDirectDOIs looks in reference tags for anchors that link to doi.org and have a doi.
 * @returns {Array<{ citeEl: Element, doi: string}>} - Return
 */
function findScienceDirectDOIs () {
  const els = []
  const cites = document.body.querySelectorAll('.reference')
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
    ...document.body.querySelectorAll('.c-reading-companion__reference-item'),
    ...document.body.querySelectorAll('[itemprop="citation"]')
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
      }
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
  const cites = [...document.body.querySelectorAll('.rc'), ...document.body.querySelectorAll('.gs_r')]
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
  const cites = document.body.querySelectorAll('.url-work')
  for (const cite of cites) {
    const anchors = cite.querySelectorAll('a')
    for (const anchor of anchors) {
      if (anchor?.href?.match(/doi\.org\/(.+)/) && anchor?.textContent?.match(/10\.(.+)/)) {
        els.push({
          citeEl: cite,
          doi: anchor.textContent
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
        doi: doi.textContent
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
      console.log(doi)
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
    style: `
    <style>
    .scite-badge {
      display: block;
      width: min-content;
      margin: 0.25rem 0;
    }
    </style>
`
  },
  {
    name: 'nature.com',
    findDoiEls: findNatureDOIs,
    position: 'beforeend',
    style: `
    <style>
    .scite-badge {
      display: block;
      width: min-content;
      margin: 0.5rem 0;
      margin-left: auto;
    }
    </style>
`
  },
  {
    name: 'scholar.google.com',
    findDoiEls: findGoogleDOIs,
    position: 'afterend',
    style: `
    <style>
    .scite-badge {
      display: block;
      width: min-content;
      margin: 0.25rem 0;
    }
    </style>
`
  },
  {
    name: 'google',
    findDoiEls: findGoogleDOIs,
    position: 'afterend',
    style: `
    <style>
    .scite-badge {
      display: block;
      width: min-content;
      margin: 0.25rem 0;
    }
    </style>
`
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
    style: `
    <style>
    .scite-badge {
      display: block;
      width: min-content;
      margin: 0.25rem 0;
    }
    </style>
`
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
    style: `
    <style>
    .scite-badge {
      display: block;
      width: min-content;
      margin: 0.5rem 0;
      margin-left: auto;
    }
    </style>
`
  },
  {
    name: 'mdpi.com',
    findDoiEls: findMDPIDOIs,
    position: 'afterend',
    style: `
    <style>
    .scite-badge {
      display: block;
      width: min-content;
      margin: 0.5rem 0;
    }
    </style>
`
  },
  {
    name: 'journals.sagepub.com',
    findDoiEls: findSageDOIs,
    position: 'afterend',
    style: `
    <style>
    .scite-badge {
      display: block;
      width: min-content;
      margin: 0.5rem 0;
    }
    </style>
`
  },
  {
    name: 'tandfonline.com',
    findDoiEls: findTandFDOIs,
    position: 'beforeend',
    style: `
    <style>
    .scite-badge {
      display: block;
      width: min-content;
      margin: 0.25rem 0;
    }
    </style>
`
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
    style: `
    <style>
    .scite-badge {
      display: block;
      margin: 0.25rem 0;
      width: max-content;
    }
    </style>
`
  },
  {
    name: 'biorxiv.org',
    findDoiEls: findBioArxivDOIs,
    position: 'beforeend',
    style: `
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
  },
  {
    name: 'medrxiv.org',
    findDoiEls: findBioArxivDOIs,
    position: 'afterend',
    style: `
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
  },
  {
    name: 'sciencemag.org',
    findDoiEls: findScienceDOIs,
    position: 'afterend',
    style: `
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
  },
  {
    name: 'webofknowledge',
    findDoiEls: findWebOfKnowledgeDOIs,
    position: 'afterend',
    style: `
    <style>
    .scite-badge {
      display: block !important;
      margin: 0.25rem 0 !important;
      width: max-content !important;
    }
    </style>
`
  },
  {
    name: 'scopus',
    findDoiEls: findScopusDOIs,
    position: 'afterend',
    style: `
    <style>
    .scite-badge {
      display: block !important;
      margin: 0.25rem 0 !important;
      width: max-content !important;
    }
    </style>
`
  },
  {
    name: 'pnas.org',
    findDoiEls: findPNASDOIs,
    position: 'afterend',
    style: `
    <style>
    .scite-badge {
      display: block !important;
      margin: 0.25rem 0 !important;
      width: max-content !important;
    }
    </style>
`
  },
  {
    name: 'europepmc.org',
    findDoiEls: findEuropePMCDOIs,
    position: 'afterend',
    initFunc: addRefereshListener('#free-full-text', 3000),
    style: `
    <style>
    .scite-badge {
      display: block !important;
      margin: 0.25rem 0 !important;
      width: max-content !important;
    }
    </style>
`
  },
  {
    name: 'connectedpapers.com',
    findDoiEls: findConnectedPapersDOIs,
    initFunc: addMutationAttributeListener(['.title_link']),
    position: 'afterend',
    style: `
    <style>
    .scite-badge {
      display: block !important;
      margin: 0.25rem 0 !important;
      width: max-content !important;
      z-index: 9999999999;
    }
    </style>
`
  },
  {
    name: 'peerj.com',
    findDoiEls: findPeerJDOIs,
    position: 'afterend',
    style: `
    <style>
    .scite-badge {
      display: block !important;
      margin: 0.25rem 0 !important;
      width: max-content !important;
      z-index: 9999999999;
    }
    </style>
`
  },
  {
    name: 'clinicaltrials.gov',
    findDoiEls: findClinicalTrialsDOIs,
    position: 'afterend',
    style: `
    <style>
    .scite-badge {
      display: block !important;
      margin: 0.25rem 0 !important;
      width: max-content !important;
      z-index: 9999999999;
    }
    </style>
`
  },
  {
    name: 'researchgate.net',
    findDoiEls: findResearchGateDOIs,
    position: 'afterend',
    style: `
    <style>
    .scite-badge {
      display: block !important;
      margin: 0.25rem 0 !important;
      width: max-content !important;
      z-index: 9999999999;
    }
    </style>
`
  }
]

export default function insertBadges () {
  let badgeSite
  for (const site of BADGE_SITES) {
    if (window.location.href.includes(site.name)) {
      badgeSite = site
    }
  }
  if (!badgeSite) {
    return
  }

  const els = badgeSite.findDoiEls()
  if (!els || els.length <= 0) {
    return
  }

  for (const el of els) {
    el.citeEl.insertAdjacentHTML(badgeSite.position, createBadge(el?.doi?.toLowerCase()?.trim()))
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

  if (badgeSite.initFunc) {
    badgeSite.initFunc()
  }
}
