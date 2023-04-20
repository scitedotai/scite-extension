/* global chrome, browser:true */
if (typeof chrome !== 'undefined' && chrome) {
  browser = chrome
}

browser.runtime.onInstalled.addListener(function (details) {
  if (details.reason === 'install') {
    browser.tabs.create({
      url: 'https://scite.ai/extension-install'
    })
  }
})

function onCreated () {
  if (browser.runtime.lastError) {
    console.log(`Error: ${browser.runtime.lastError}`)
  } else {
    console.log('Item created successfully')
  }
}

browser.contextMenus.create({
  id: 'scite-citation-search',
  title: 'Ask scite.ai assistant',
  contexts: ['selection']
}, onCreated)

browser.contextMenus.onClicked.addListener(function (info, tab) {
  if (info.menuItemId === 'scite-citation-search') {
    if (info.selectionText) {
      const encodedSelection = encodeURIComponent(
        `${info.selectionText}`
      )

      browser.tabs.create({
        url: `https://scite.ai/assistant?startTerm=${encodedSelection}&utm_source=generic&utm_medium=plugin&utm_campaign=plugin-citation-search`
      })
    }
  }
})
