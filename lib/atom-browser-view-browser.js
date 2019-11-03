'use babel';
import { CompositeDisposable, Disposable } from 'atom';
import AtomBrowserListener from './atom-browser-listener'

const fs = require('fs')
const ViewNavbar = require('../views/Navbar')
const ViewWebview = require('../views/Webview')


import {
   CONFIG_RELOAD_DELAY,
   CONFIG_AUTO_PREFIX,
   CONFIG_EMITTER_ENABLED,
   CONFIG_EMITTER_PORT,
} from './atom-browser-confignames'

export default class AtomBrowserViewBrowser {
   constructor({
      defaultLocation,
      showBackground,
      initialUrl,
   }) {
      this.subscriptions = new CompositeDisposable()
      this.showBackground = showBackground
      this.location = defaultLocation
      this.reloading = false
      this.initialUrl = initialUrl
      this.iframeInfo = {}

      this.element = document.createElement('div')
      this.element.setAttribute('id', 'atombrowser-view')
      this.element.innerHTML += ViewNavbar()
      this.element.innerHTML += ViewWebview()

      this.getTitle = () => 'Atom Browser',
         this.getURI = () => 'atom://atom-web/webview' + Math.random()
      this.getDefaultLocation = () => this.location
      this.getAllowedLocations = () => ['bottom', 'right']

      // wait for the html to be appended
      this.html = this.selectHtml()
      this.setListeners()
      this.applySettingViewBackground(this.showBackground)
      this.setURL(this.initialUrl)
      this.setupWebsocketListener()
   }

   selectHtml() {
      return {
         webview: this.element.querySelector('#atombrowser-webview'),
         addressbar: this.element.querySelector('#atombrowser-addressbar'),
         btn: {
            reload: this.element.querySelector('#atombrowser-btn-reload'),
            back: this.element.querySelector('#atombrowser-btn-back'),
            devtools: this.element.querySelector('#atombrowser-btn-devtools'),
            livereload: this.element.querySelector('#atombrowser-btn-livereload'),
            tabs: this.element.querySelector('#atombrowser-btn-tabs')
         }
      }
   }

   setListeners() {
      this.subscriptions.add(
         atom.commands.add('atom-workspace', {
            'atom-browser:reload': () => this.reload(),
            'atom-browser:devtools': () => this.devtools()
         }),
      )

      this.html.webview.addEventListener('did-start-loading', () => {
         this.html.btn.reload.classList.add('loading')
      })

      this.html.webview.addEventListener('did-stop-loading', () => {
         this.html.btn.reload.classList.remove('loading')
         this.html.addressbar.value = this.html.webview.getURL()

         this.onload()
      })

      // url bar
      var lastCall = Date.now()
      this.html.addressbar.addEventListener('paste', (e) => {
         if (Date.now() - lastCall < 100) e.preventDefault()
         lastCall = Date.now()
      })

      this.html.addressbar.addEventListener('keyup', (e) => {
         if (e.key == 'Enter') this.setURL(this.html.addressbar.value)
      })

      // button events Back/Reload/Tools
      this.html.btn.reload.addEventListener('click', () => this.reload())
      this.html.btn.back.addEventListener('click', () => this.back())
      this.html.btn.devtools.addEventListener('click', () => this.devtools())
      this.html.btn.livereload.addEventListener('click', () => {
         var active = !this.html.btn.livereload.classList.contains('active')
         this.html.btn.livereload.classList.toggle('active', active)
      })

      // refresh on save
      atom.workspace.observeTextEditors((editor) => {
         editor.onDidSave(() => {
            if (this.html.btn.livereload.classList.contains('active')) {
               if (this.reloading) return
               this.reloading = true
               setTimeout(() => {
                  this.reload()
                  this.reloading = false
               }, atom.config.get(CONFIG_RELOAD_DELAY))
            }
         })
      })
   }

   setupWebsocketListener() {
      this.listener = new AtomBrowserListener({
         browser: true,
         onEvent: (data) => {
            this.iframeInfo = data
         }
      })

      if (atom.config.get(CONFIG_EMITTER_ENABLED)) {
         this.listener.listen()
      }
   }

   isInDom() {
      return document.body.contains(this.element)
   }

   /*------------------------------------------------------------------------*/
   /*----------------------------| button actions |--------------------------*/
   /*------------------------------------------------------------------------*/
   devtools() {
      if (!this.html.webview.getWebContents()) return

      if (this.html.webview.isDevToolsOpened()) {
         this.html.webview.closeDevTools()
      } else {
         this.html.webview.openDevTools()
      }
   }

   /*------------------------------------------------------------------------*/
   /*--------------------------| webview functions |-------------------------*/
   /*------------------------------------------------------------------------*/
   setURL(url) {
      if (url.length === 0) return

      // search google
      if (!url.includes('://') && !url.startsWith('localhost'))
         if (url.indexOf(' ') >= 0 || !url.includes(' ') && !url.includes('.'))
            url = 'https://www.google.com/#q=' + url

      // add http://
      if (!url.includes('://'))
         if (!url.includes('https://') && !url.includes('file://'))
            url = atom.config.get(CONFIG_AUTO_PREFIX) + "://" + url

      this.html.webview.src = ''
      this.html.webview.src = url
      this.html.addressbar.value = url
   }

   reload() {
      if (this.html.webview.getWebContents())
         this.html.webview.reload()
   }

   onload() {
      if (atom.config.get(CONFIG_EMITTER_ENABLED)) {
         this.html.webview.executeJavaScript(`
            window.atomBrowserConnectEmitter.setup(
               ${atom.config.get(CONFIG_EMITTER_PORT)},
               ${JSON.stringify(this.iframeInfo)}
            )`
         );
      }
   }

   back() {
      if (this.html.webview.getWebContents() && this.html.webview.canGoBack())
         this.html.webview.goBack()
   }

   applySettingViewBackground(show) {
      this.showBackground = show
      this.html.webview.classList.toggle('show-background', this.showBackground)
   }

   destroy() {
      this.element.remove()
      this.subscriptions.dispose()
      this.listener.destroy()
   }
}
