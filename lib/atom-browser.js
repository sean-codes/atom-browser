'use babel';
import AtomBrowserView from './atom-browser-view'
import { CompositeDisposable } from 'atom'

export default {
   subscriptions: null,

   deactivate() {
      this.subscriptions.dispose();
   },

   activate(state) {
      this.view = new AtomBrowserView(state.AtomBrowserViewState)
		this.reloading = false
      this.setUpTheKeyBinds()
      this.listen()
   },
   /*------------------------------------------------------------------------*/
   /*--------------------------| Keyboard Binds |----------------------------*/
   /*------------------------------------------------------------------------*/
   setUpTheKeyBinds(){
      this.subscriptions = new CompositeDisposable();
      this.subscriptions.add(atom.commands.add('atom-workspace', {
         'atom-browser:preview': () => this.preview(),
         'atom-browser:reload': () => this.reload(),
         'atom-browser:devtools': () => this.devtools(),
         'atom-browser:showHide': () => this.showHide(),
         'atom-browser:search': () => this.search()
      }))
   },
   showHide(){
      if(atom.workspace.getBottomDock().state.visible){
         atom.workspace.getBottomDock().hide()
      } else {
         atom.workspace.getBottomDock().show()
         atom.workspace.open(this.view.workspace)
      }
   },
   /*------------------------------------------------------------------------*/
   /*--------------------------| Event Listeners |---------------------------*/
   /*------------------------------------------------------------------------*/
   listen: function(){
      this.view.html.webview.addEventListener('did-start-loading', () => {
         this.view.html.btn.reload.classList.add('loading')
      })

      this.view.html.webview.addEventListener('did-stop-loading', () => {
         this.view.html.btn.reload.classList.remove('loading')
         this.view.html.addressbar.value = this.view.html.webview.getURL()
      })

      //URL Bar
      var lastCall = Date.now()
      this.view.html.addressbar.addEventListener('paste', (e) => {
         if(Date.now() - lastCall < 100)
            e.preventDefault()
         lastCall = Date.now()
      })

      this.view.html.addressbar.addEventListener('keyup', (e) => {
         if(e.key == 'Enter')
            this.setURL(this.view.html.addressbar.value)
      })

      //Button Events Back/Reload/Tools
      this.view.html.btn.reload.addEventListener('click', () => this.reload() )
      this.view.html.btn.back.addEventListener('click', () => this.back() )
      this.view.html.btn.devtools.addEventListener('click', () => this.devtools() )
      this.view.html.btn.livereload.addEventListener('click', () => {
         var active = !this.view.html.btn.livereload.classList.contains('active')
         this.view.html.btn.livereload.classList.toggle('active', active)
      })
      //this.view.html.btn.tabs.addEventListener('click', () => this.tabs() )

      //Refresh on save
      atom.workspace.observeTextEditors((editor) => {
         editor.onDidSave(() => {
            if(this.view.html.btn.livereload.classList.contains('active')){
					if(this.reloading) return
					this.reloading = true
               setTimeout(() => {
						this.reload();
						this.reloading = false
					}, 1000)
				}
         })
      })
   },
   /*------------------------------------------------------------------------*/
   /*-----------------------| Address Bar Functions |------------------------*/
   /*------------------------------------------------------------------------*/
   setURL: function(url){
      //Fix url
      //Search google
      if(!url.includes('://') && !url.startsWith('localhost'))
         if(url.indexOf(' ') >= 0 || !url.includes(' ') && !url.includes('.'))
            url = 'https://www.google.com/#q='+url
      //Add http://
      if(!url.includes('://'))
         if(!url.includes('https://') && !url.includes('file://'))
            url = 'http://' + url

      this.view.html.webview.src = ''
      this.view.html.webview.src = url
      this.view.html.addressbar.value = url;
   },
   /*------------------------------------------------------------------------*/
   /*--------------------------| Webview Functions |-------------------------*/
   /*------------------------------------------------------------------------*/
   reload(){
      if(this.view.html.webview.getWebContents())
         this.view.html.webview.reload()
   },
   back(){
      if(this.view.html.webview.getWebContents() && this.view.html.webview.canGoBack())
         this.view.html.webview.goBack()
   },
   /*------------------------------------------------------------------------*/
   /*------------------------| Buttons Functions |---------------------------*/
   /*------------------------------------------------------------------------*/
   preview(){
      //Get the selected path
      var selected = document.querySelector('.atom-dock-inner .selected .name')
		if(!selected) return

      var path = selected.getAttribute('data-path')
      const fileURL = 'file:///'+path

      this.setURL(fileURL)
      atom.workspace.open(this.view.workspace)
   },
   search(){
      var workspace = atom.workspace.open(this.view.workspace).then(() => {
         this.view.html.addressbar.select()
      })
   },
   devtools(){
      if(!this.view.html.webview.getWebContents()) return

      (this.view.html.webview.isDevToolsOpened())
      ? this.view.html.webview.closeDevTools()
      : this.view.html.webview.openDevTools()
   },
   tabs(){
      this.view.html.tabs.style.display =
      	(this.view.html.tabs.style.display == '') ? 'none' : ''
   }
}
