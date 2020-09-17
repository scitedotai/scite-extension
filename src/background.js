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
