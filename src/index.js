/*
 * Adapted from: https://github.com/Impactstory/unpaywall
 */

import 'whatwg-fetch'

import React from 'react'
import { render } from 'react-dom'
import { Tally, TallyLoader } from 'scite-widget'
import 'scite-widget/lib/main.css'
import styles from './styles.css'
import insertBadges from './badges'

const IS_DEV = typeof process !== 'undefined' && process.NODE_ENV === 'development'
const devLog = IS_DEV ? console.log.bind(window) : function () {}


const SCITE_HOSTS = [
  'scite.ai',
  'staging.scite.ai',
  'localhost'
]

const DONT_POPUP_HOST = [
  'wikipedia.org',
  'scholar.google.com',
  'google'
]

const docAsStr = document.documentElement.innerHTML
const docTitle = document.title
const myHost = window.location.hostname

let poppedUp = false

function runRegexOnDoc (re, host) {
  // @re regex that has a submatch in it that we're searching for, like /foo(.+?)bar/
  // @host optional. only work on this host.

  if (!host || host === myHost) {
    const m = re.exec(docAsStr)
    if (m && m.length > 1) {
      return m[1]
    }
  }
  return false
}

// most scholarly articles have some kind of DOI meta
// tag in the head of the document. Check these.
function findDoiFromMetaTags () {
  // collection of the various ways different publishers may
  // indicate a given meta tag has the DOI.
  const doiMetaNames = [
    'citation_doi',
    'doi',
    'dc.doi',
    'dc.identifier',
    'dc.identifier.doi',
    'bepress_citation_doi',
    'rft_id',
    'dcsext.wt_doi'
  ]
  const metas = document.querySelectorAll('meta')
  let doi

  metas.forEach(function (myMeta) {
    if (!myMeta.name) {
      return true // keep iterating
    }

    // has to be a meta name likely to contain a DOI
    if (doiMetaNames.indexOf(myMeta.name.toLowerCase()) < 0) {
      return true // continue iterating
    }

    // SAGE journals have weird meta tags with scheme='publisher-id'
    // those DOIs have strange character replacements in them, so ignore.
    // making universal rule cos i bet will help some other places too.
    // eg:
    //      http://journals.sagepub.com/doi/10.1207/s15327957pspr0203_4
    //      http://journals.sagepub.com/doi/abs/10.1177/00034894991080S423
    if (myMeta.scheme && myMeta.scheme !== 'doi') {
      return true // continue iterating
    }

    // content has to look like a  DOI.
    // much room for improvement here.
    const doiCandidate = myMeta.content.replace('doi:', '').trim()
    if (doiCandidate.indexOf('10.') === 0) {
      doi = doiCandidate
    }
  })

  if (!doi) {
    return null
  }
  devLog('found a DOI from a meta tag', doi)

  // all done.
  return doi
}

// sniff DOIs from the altmetric.com widget.
function findDoiFromDataDoiAttributes () {
  const dataDoiValues = []
  const dataDoiNodes = document.querySelectorAll('*[data-doi]')
  dataDoiNodes.forEach(function (node) {
    dataDoiValues.push(node.dataset.doi)
  })

  // if there are multiple unique DOIs, we're on some kind of TOC page,
  // we don't want none of that noise.
  const numUniqueDois = new Set(dataDoiValues).size
  if (numUniqueDois === 1) {
    devLog('found a DOI from a [data-doi] attribute')
    return dataDoiValues[0]
  }

  return null
}

// ScienceDirect
// eg: http://www.sciencedirect.com/science/article/pii/S1751157709000881 (green)
// eg: http://www.sciencedirect.com/science/article/pii/S0742051X16306692
function findDoiFromScienceDirect () {
  if (myHost.indexOf('sciencedirect') < 0) {
    return null
  }

  // the old version of ScienceDirect requires a hack to read DOI from js var
  const doi = runRegexOnDoc(/SDM.doi\s*=\s*'([^']+)'/)
  if (doi) {
    return doi
  }

  // the new React-based version of ScienceDirect pages
  const doiLinkElem = document.querySelectorAll('a.doi')
  if (doiLinkElem.length) {
    const m = doiLinkElem[0].innerHTML.match(/doi\.org\/(.+)/)
    if (m && m.length > 1) {
      return m[1]
    }
  }
}

function findDoiFromIeee () {
  // green:   http://ieeexplore.ieee.org/document/6512846/
  // thanks to @zuphilip for a PR to get this started.
  return runRegexOnDoc(/'doi':'([^']+)'/, 'ieeexplore.ieee.org')
}

function findDoiFromNumber () {
  // green:   http://www.nber.org/papers/w23298.pdf
  return runRegexOnDoc(/Document Object Identifier \(DOI\): (10.*?)<\/p>/, 'www.nber.org')
}

function findDoiFromPubmed () {
  // gold:   https://www.ncbi.nlm.nih.gov/pubmed/17375194

  if (myHost.indexOf('www.ncbi.nlm.nih.gov') < 0) {
    return null
  }

  const doiLinkElem = document.querySelectorAll("a[ref='aid_type=doi']")
  if (doiLinkElem.length) {
    return doiLinkElem[0].textContent
  }
}

function findDoiFromPsycnet () {
  // gray: http://psycnet.apa.org/record/2000-13328-008
  const re = /href='\/doi\/10\.(.+)/
  return runRegexOnDoc(re, 'psycnet.apa.org')
}

function findDoiFromTitle () {
  // Crossref DOI regex. See https://www.crossref.org/blog/dois-and-matching-regular-expressions/
  const re = /(10.\d{4,9}\/[-._;()/:A-Z0-9]+)/ig
  const doi = docTitle.match(re)
  return doi ? doi[0] : null
}

function findDoi () {
  // we try each of these functions, in order, to get a DOI from the page.
  const doiFinderFunctions = [
    findDoiFromMetaTags,
    findDoiFromDataDoiAttributes,
    findDoiFromScienceDirect,
    findDoiFromIeee,
    findDoiFromNumber,
    findDoiFromPsycnet,
    findDoiFromPubmed,
    findDoiFromTitle
  ]

  for (let i = 0; i < doiFinderFunctions.length; i++) {
    const myDoi = doiFinderFunctions[i]()
    if (myDoi) {
      // if we find a good DOI, stop looking
      return myDoi
    }
  }
}

function popupDoi (doi) {
  const popup = document.createElement('div')

  if (poppedUp) {
    return false
  }
  popup.scrolling = 'no'
  popup.className = styles.sciteApp

  document.documentElement.appendChild(popup)
  render(
    (
      <TallyLoader doi={doi}>
        {({ tally, notices }) => (
          <Tally tally={tally} notices={notices} />
        )}
      </TallyLoader>
    ),
    popup
  )
  poppedUp = true
}

function markPage () {
  const marker = document.createElement('div')
  marker.id = 'scite-extension-marker'
  document.body.appendChild(marker)

  const extensionLoadEvent = new Event('scite-extension/loaded');
  window.dispatchEvent(extensionLoadEvent)
}

function main () {
  if (SCITE_HOSTS.includes(myHost)) {
    markPage()
    return
  }
  insertBadges()

  for (let site of DONT_POPUP_HOST) {
    // Incase the host has a sub domain like en.wikipedia or fr.wikipedia
    // we check a lesser substring with includes.
    if (window.location.href.includes(site)) {
      return
    }
  }
  const doi = findDoi()

  if (!doi) {
    return
  }

  popupDoi(doi)
}

function runWithDelay () {
  var delay = 200

  // Single-page apps take a while to fully load all the HTML,
  // and until they do we can't find the DOI
  var longDelayHosts = [
    'psycnet.apa.org',
    'www.sciencedirect.com',
    'mdpi.com',
    'onlinelibrary.wiley.com'
  ]

  // it would be better to poll, but that is more complicated and we don't
  // have many reports of SPAs like this yet.
  if (longDelayHosts.includes(myHost)) {
    delay = 3000
  }
  setTimeout(main, delay)
}

runWithDelay()
