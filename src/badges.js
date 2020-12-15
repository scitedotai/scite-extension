const BADGE_SCRIPT = `
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
  const references = document.body.querySelectorAll('.references-and-notes-list')
  for (let reference of references) {
    const re = /(10.\d{4,9}\/[-._;()/:A-Z0-9]+)/ig
    const text = reference.textContent.match(re)
    if (text && text.length > 0) {
      els.push({
        citeEl: reference,
        // Pubmed puts a period at the end of their dois for biblographic display reasons.
        // We must slice it.
        doi: text[0].slice(0, -1)
      })
    }
  }
  return els
}


function removeElementsByClass(className){
  var elements = document.getElementsByClassName(className);
  while(elements.length > 0){
      elements[0].parentNode.removeChild(elements[0]);
  }
}

/**
 * addPMSeeAllReferencesListener adds an event listener on seeing all references so we can
 * reload badges.
 */
function addPMSeeAllReferencesListener() {
  const showAll = document.body.querySelector('.show-all')
  if (showAll) {
    showAll.addEventListener("click", () => {
      removeElementsByClass('scite-badge')
      setTimeout(() => insertBadges(), 1000)
    });
  }
}

/**
 * findPubMedDOIEls looks in cite tags for text beginning with DOI and captures it as a doi
 * @returns {Array<{ citeEl: HTMLElement, doi: string}>} - Return
 */
function findPubMedCentralDOIEls() {
  const els = []
  const cites = document.body.querySelectorAll('.rslt')
  for (let cite of cites) {
    const doiEl = cite.querySelector('.doi')
    try {
      const re = /(10.\d{4,9}\/[-._;()/:A-Z0-9]+)/ig
      const doi = doiEl.textContent.match(re)
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

  let references = document.body.querySelectorAll('.element-citation')
  for (let reference of references) {
    const re = /(10.\d{4,9}\/[-._;()/:A-Z0-9]+)/ig
    const text = reference.textContent.match(re)
    if (text && text.length > 0) {
      els.push({
        citeEl: reference,
        // Pubmed puts a period at the end of their dois for biblographic display reasons.
        // We must slice it.
        doi: text[0].slice(0, -1)
      })
    }
  }

  references = document.body.querySelectorAll('.mixed-citation')
  for (let reference of references) {
    const re = /(10.\d{4,9}\/[-._;()/:A-Z0-9]+)/ig
    const text = reference.textContent.match(re)
    if (text && text.length > 0) {
      els.push({
        citeEl: reference,
        // Pubmed puts a period at the end of their dois for biblographic display reasons.
        // We must slice it.
        doi: text[0].slice(0, -1)
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


/**
 * findScienceDirectDOIs looks in reference tags for anchors that link to doi.org and have a doi.
 * @returns {Array<{ citeEl: HTMLElement, doi: string}>} - Return
 */
function findScienceDirectDOIs() {

  const els = []
  const cites = document.body.querySelectorAll('.reference')

  for (let cite of cites) {
  
    const anchors = cite.querySelectorAll('a')
    for (let anchor of anchors) {
      const doi = anchor.href.match(/doi\.org\/(.+)/)

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
 * @returns {Array<{ citeEl: HTMLElement, doi: string}>} - Return
 */
function findELifeSciencesDOIs() {
  const els = []
  const cites = document.body.querySelectorAll('.doi')
  for (let cite of cites) {
    const anchors = cite.querySelectorAll('a')
    for (let anchor of anchors) {
      const doi = anchor.href.match(/doi\.org\/(.+)/)
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
 * @returns {Array<{ citeEl: HTMLElement, doi: string}>} - Return
 */
function findNatureDOIs() {
  const els = []
  let cites = document.body.querySelectorAll('.c-article-references__links')
  for (let cite of cites) {
    const anchors = cite.querySelectorAll('a')
    for (let anchor of anchors) {
      const doi = anchor.href.match(/doi\.org\/(.+)/)
      if (doi && doi.length > 1) {
        els.push({
          citeEl: cite,
          doi: decodeURIComponent(doi[1])
        })
      }
    }
  }
  cites = document.body.querySelectorAll('.c-reading-companion__reference-item')
  for (let cite of cites) {
    const anchors = cite.querySelectorAll('a')
    for (let anchor of anchors) {
      const doi = anchor.href.match(/doi\.org\/(.+)/)
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
 * findGoogleScholarDOIs looks in reference tags that link to doi.org.
 * @returns {Array<{ citeEl: HTMLElement, doi: string}>} - Return
 */
function findGoogleScholarDOIs() {
  const els = []
  let cites = document.body.querySelectorAll('.gs_r')
  for (let cite of cites) {
    const anchors = cite.querySelectorAll('a')
    for (let anchor of anchors) {
      const doi = anchor.href.match(/10\.(.+)/)
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
    initFunc: addPMSeeAllReferencesListener
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
    position: 'beforeend',
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
    name: 'scholar.google.com',
    findDoiEls: findGoogleScholarDOIs,
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
  }
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
  console.log(els.length)
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
  if(badgeSite.style) {
    document.documentElement.appendChild(
      range.createContextualFragment(badgeSite.style)
    )
  }
  
  if (badgeSite.initFunc) {
    badgeSite.initFunc()
  }
}