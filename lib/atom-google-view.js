'use babel';
//New Wave Javascript! Classy!
const fs = require('fs')
const pathPackage = atom.packages.resolvePackagePath('atom-browser')
function getTemplate(name){
   return fs.readFileSync(pathPackage + `/templates/${name}.html`, "utf8");
}

export default class AtomGoogleView {

   constructor(serializedState) {
      //Create a webview and input
      this.setUpHTML();
      this.setUpEventListeners();
   }


   setUpHTML(){
      var view = document.createElement('div')
      view.setAttribute('class', 'atom-google-view')

      //Get the html templates
      var webview = getTemplate('webview')
      var navbar = getTemplate('navbar')
      var tabs = getTemplate('tabs')

      //Append the html
      view.innerHTML += webview
      view.innerHTML += navbar
      view.innerHTML += tabs
      this.view = {
         element: view,
         getTitle: () => 'Atom Web',
         getURI: () => 'atom://atom-web/webview',
         getDefaultLocation: () => 'bottom'
      }

      //Some html for later
      this.webview = view.getElementsByTagName('webview')[0]
      this.urlbar = view.getElementsByTagName('input')[0]
      this.reloadbtn = view.querySelector('#atom-browser-refreshButton')
      this.backbtn = view.querySelector('#atom-browser-backbutton')
      this.devtoolsbtn = view.querySelector('#atom-browser-devtools')
      this.autorefresh = view.querySelector('#atom-browser-autorefresh')
      this.btn_tabs = view.querySelector('#atom-browser-btn-tabs')
      this.modal_tabs = view.querySelector('#atom-browser-tabs')
   }


   setUpEventListeners(){
      var that = this
      this.webview.addEventListener('did-start-loading', function(){
         that.reloadbtn.classList.add('loading')
      })

      this.webview.addEventListener('did-stop-loading', function(){
         that.reloadbtn.classList.remove('loading')
      })

      var that = this
      //URL Bar
      this.urlbar.addEventListener('keyup', function(e){
         if(e.key == 'Enter')
            that.setURL(this.value)

      })

      //Button Events Back/Reload/Tools
      this.reloadbtn.addEventListener('click', () => { this.reload() })
      this.backbtn.addEventListener('click', () => { this.back() })
      this.devtoolsbtn.addEventListener('click', () => { that.devtools() })
      this.autorefresh.addEventListener('click', function(){
         this.classList.toggle('active', !this.classList.contains('active'))
      })
      this.btn_tabs.addEventListener('click', () => { that.toggleTabs() })

      //Refresh on save
      atom.workspace.observeTextEditors(function(editor){
         editor.onDidSave(function(){
            console.log('save')
            if(that.autorefresh.classList.contains('active')){
               console.log('zap active')
               that.reload()
            }
         })
      })
   }

   preview(path){
      const fileURL = 'file:///'+path
      this.setURL(fileURL)
      atom.workspace.open(this.view)
   }
   reload(){
      if(this.webview.getWebContents())
         this.webview.reload()
   }
   back(){
      if(this.webview.canGoBack())
         this.webview.goBack()
   }
   devtools(){
      if(!this.webview.getWebContents()) return

      (this.webview.isDevToolsOpened())
         ? this.webview.closeDevTools()
         : this.webview.openDevTools()
   }
   toggleTabs(){
      this.modal_tabs.style.display = (this.modal_tabs.style.display == '')
         ? 'none'
         : ''
      console.log('toggleing' + this.modal_tabs.style.display)
   }

   setURL(url){
      //Fix url
      //Search google
      if(url.indexOf('file://') < 0 && (url.indexOf(' ') >= 0 || url.indexOf(' ') < 0 && url.indexOf('.') < 0))
         url = 'https://www.google.com/#q='+url
      //Add http://
      if(url.indexOf('http://') < 0 && url.indexOf('https://') < 0 && url.indexOf('file://') < 0)
         url = 'http://' + url


      this.urlbar.value = url;
      this.webview.src = ''
      this.webview.src = this.urlbar.value
   }
}
