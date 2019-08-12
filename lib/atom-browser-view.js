'use babel';

const fs = require('fs')
const ViewNavbar = require('../views/Navbar')
const ViewWebview = require('../views/Webview')

const PATH_PACKAGE = atom.packages.resolvePackagePath('atom-browser')
const VIEW_SETTINGS = [
   {
      name: 'atom-browser.viewShowBackground',
      html: 'webview',
      class: 'showBackground'
   },
   {
      name: 'atom-browser.viewDefaultLocation',
      html: 'webview',
      class: 'defaultLocation'
   }
]

export default class AtomBrowserView {
   constructor({serializedState, onReady }) {
      var dockLocation = atom.config.get('atom-browser.viewDefaultLocation')
      dockLocation = dockLocation ? dockLocation : 'bottom'

      // 1. setup the html
      this.view = document.createElement('div')
      this.view.setAttribute('id', 'atombrowser-view')
      this.view.innerHTML += ViewNavbar()
      this.view.innerHTML += ViewWebview()

      // 2. select html
      this.html = {}
      setTimeout(() => {
         this.setHtml()
         this.loadAndWatchViewSettings()
         this.workspace = {
            element: this.view,
            getTitle: () => 'Atom Browser',
            getURI: () => 'atom://atom-web/webview',
            getDefaultLocation: () => dockLocation
         }
         onReady()
      })
   }

   setHtml() {
      this.html = {
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

   loadAndWatchViewSettings() {
      // Loop the settings and toggle on or off
      console.log('wut the heck', this, this.html)
      for (var setting of VIEW_SETTINGS) {
         if (!setting.listening) this.watchSetting(setting)

         if (setting.name === 'showBackground') {
            var value = atom.config.get(setting.name)
         }

         var html = this.html[setting.html]
         html.classList.toggle(setting.class, value)
      }
   }

   watchSetting(setting) {
      atom.config.onDidChange(setting.name, () => { this.loadAndWatchViewSettings() })
      setting.listening = true
   }
}
