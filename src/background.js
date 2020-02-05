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

browser.runtime.onMessageExternal.addListener((message, _sender, sendResponse) => {
  if (message === 'version') {
    const manifest = browser.runtime.getManifest()
    sendResponse({
      type: 'success',
      version: manifest.version
    })
  }
  return true
})
