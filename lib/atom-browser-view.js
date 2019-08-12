'use babel';

const fs = require('fs')
const ViewNavbar = require('../views/Navbar')
const ViewWebview = require('../views/Webview')

const PATH_PACKAGE = atom.packages.resolvePackagePath('atom-browser')
const SETTING_WEBVIEW_BACKGROUND = 'atom-browser.viewShowBackground'
const SETTING_DEFAULT_LOCATION = 'atom-browser.viewDefaultLocation'

export default class AtomBrowserView {
   constructor({serializedState, onReady }) {
      var dockLocation = atom.config.get(SETTING_DEFAULT_LOCATION)
      dockLocation = dockLocation ? dockLocation : 'bottom'

      // 1. setup the html
      this.view = document.createElement('div')
      this.view.setAttribute('id', 'atombrowser-view')
      this.view.innerHTML += ViewNavbar()
      this.view.innerHTML += ViewWebview()

      // 2. we have to wait a moment for html to process
      setTimeout(() => {
         this.html = this.selectHtml()
         this.applyAndWatchViewSettings()
         this.workspace = {
            element: this.view,
            getTitle: () => 'Atom Browser',
            getURI: () => 'atom://atom-web/webview',
            getDefaultLocation: () => dockLocation
         }
         onReady()
      })
   }

   selectHtml() {
      return {
         webview: this.view.querySelector('#atombrowser-webview'),
         addressbar: this.view.querySelector('#atombrowser-addressbar'),
         btn: {
            reload: this.view.querySelector('#atombrowser-btn-reload'),
            back: this.view.querySelector('#atombrowser-btn-back'),
            devtools: this.view.querySelector('#atombrowser-btn-devtools'),
            livereload: this.view.querySelector('#atombrowser-btn-livereload'),
            tabs: this.view.querySelector('#atombrowser-btn-tabs')
         }
      }
   }

   applyAndWatchViewSettings() {
      this.applySettingViewBackground()
      this.applySettingDefaultLocation()

      atom.config.onDidChange(SETTING_WEBVIEW_BACKGROUND, () => this.applySettingViewBackground())
      atom.config.onDidChange(SETTING_DEFAULT_LOCATION, () => this.applySettingDefaultLocation())
   }

   applySettingViewBackground() {
      const value = atom.config.get(SETTING_WEBVIEW_BACKGROUND)
      console.log(this.html)
      this.html.webview.classList.toggle('show-background', value)
   }

   applySettingDefaultLocation() {
      const value = atom.config.get(SETTING_DEFAULT_LOCATION)
      console.log('default location value', value)
   }
}
