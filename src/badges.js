const BADGE_SCRIPT = `
<style>
.scite-badge {
  margin-left: 0.25rem;
}
</style>
<link rel="stylesheet" type="text/css" href="https://cdn.scite.ai/badge/scite-badge-latest.min.css">
<script async type="application/javascript" src="https://cdn.scite.ai/badge/scite-badge-latest.min.js">
</script>`

function createBadge(doi) {
  return `<div class="scite-badge" data-doi="${doi}" data-layout="horizontal" data-small="true"/>`
}

/**
 * findPubMedDOIEls looks in cite tags for text beginning with DOI and captures it as a doi
 * @returns {Array<{ citeEl: HTMLElement, doi: string}>} - Return
 */
function findPubMedDOIEls() {
  const els = []
  const cites = document.body.querySelectorAll('.docsum-content')
  for (let cite of cites) {
    const re = /(10.\d{4,9}\/[-._;()/:A-Z0-9]+)/ig
    const text = cite.textContent.match(re)
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
 * @returns {Array<{ citeEl: HTMLElement, doi: string}>} - Return
 */
function findPubMedCentralDOIEls() {
  const els = []
  const cites = document.body.querySelectorAll('.rprt')
  for (let cite of cites) {
    const doiEl = cite.querySelector('.doi')
    const re = /(10.\d{4,9}\/[-._;()/:A-Z0-9]+)/ig
    const doi = doiEl.textContent.match(re)
    if (doi && doi.length > 0) {
      els.push({
        citeEl: cite,
        doi: doi[0]
      })
    }
  }
  return els
}

/**
 * findWikipediaDOIEls looks in cite tags for anchors that link to doi.org and have a doi.
 * @returns {Array<{ citeEl: HTMLElement, doi: string}>} - Return
 */
function findWikipediaDOIEls() {
  const els = []
  const cites = document.body.querySelectorAll('cite')
  for (let cite of cites) {
    const anchors = cite.querySelectorAll('a')
    for (let anchor of anchors) {
      if(anchor.href.match(/doi\.org\/(.+)/) && anchor.textContent.match(/10\.(.+)/)) {
        els.push({
          citeEl: cite,
          doi: anchor.textContent
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
    position: 'afterend'
  },
  // {
  //   name: 'pubmed.ncbi.nlm.nih.gov',
  //   findDoiEls: findPubMedDOIEls,
  //   position: 'beforeend'
  // },
  // {
  //   name: 'ncbi.nlm.nih.gov/pmc',
  //   findDoiEls: findPubMedCentralDOIEls,
  //   position: 'beforeend'
  // }
]

export default function insertBadges() {
  let badgeSite
  for (let site of BADGE_SITES) {
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

  for (let el of els) {
    el.citeEl.insertAdjacentHTML(badgeSite.position, createBadge(el.doi))
  }

  // if we have dois then add badge to them.
  // use range and contextual fragment so the script gets executed.
  const range = document.createRange()
  range.setStart(document.documentElement, 0)
  document.documentElement.appendChild(
    range.createContextualFragment(BADGE_SCRIPT)
  )
}