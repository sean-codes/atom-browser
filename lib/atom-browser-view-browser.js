'use babel';
import { CompositeDisposable, Disposable } from 'atom';

const fs = require('fs')
const ViewNavbar = require('../views/Navbar')
const ViewWebview = require('../views/Webview')

const CONFIG_AUTO_PREFIX = 'atom-browser.autoPrefix'

export default class AtomBrowserViewBrowser {
   constructor({
      defaultLocation,
      showBackground,
      initialUrl,
   }) {
      this.showBackground = showBackground
      this.location = defaultLocation
      this.reloading = false
      this.initialUrl = initialUrl

      this.view = document.createElement('div')
      this.view.setAttribute('id', 'atombrowser-view')
      this.view.innerHTML += ViewNavbar()
      this.view.innerHTML += ViewWebview()

      this.element = this.view,
      this.getTitle = () => 'Atom Browser',
      this.getURI = () => 'atom://atom-web/webview' + Math.random()
      this.getDefaultLocation = () => this.location

      // wait for the html to be appended
      setTimeout(() => {
         this.html = this.selectHtml()
         this.setListeners()
         this.applySettingViewBackground(this.showBackground)
         this.setURL(this.initialUrl)
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

   setListeners() {
      this.subscriptions = new CompositeDisposable()
      this.subscriptions.add(
         atom.commands.add('atom-workspace', {
            'atom-browser:preview': () => this.preview(),
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
               }, 1000)
            }
         })
      })
   }

   /*------------------------------------------------------------------------*/
   /*----------------------------| button actions |--------------------------*/
   /*------------------------------------------------------------------------*/
   preview() {
      // get the selected path
      var selected = document.querySelector('.atom-dock-inner .selected .name')
      if (!selected) return

      var path = selected.getAttribute('data-path')
      const fileURL = 'file:///' + path

      this.setURL(fileURL)
      atom.workspace.open(this.view.workspace)
   }

   search() {
      var workspace = atom.workspace.open(this).then(() => {
         this.html.addressbar.select()
      })
   }

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

   back() {
      if (this.html.webview.getWebContents() && this.html.webview.canGoBack())
         this.html.webview.goBack()
   }

   applySettingViewBackground(show) {
      this.showBackground = show
      this.html.webview.classList.toggle('show-background', this.showBackground)
   }

   destroy() {
      this.subscriptions.dispose()
   }
}
