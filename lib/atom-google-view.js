'use babel';

//New Wave Javascript! Classy!
export default class AtomGoogleView {

   constructor(serializedState) {
      //Create a webview and input
      this.createWebView();
      this.createUserInput()

      //Append and Ready Dock/Modal
      this.readyModal()
   }

   readyModal(){
      //Create the Modal
      this.modalPanel = atom.workspace.addModalPanel({ item: this.input, visible: false });
   }

   createWebView(){
      var view = document.createElement('div')
      view.setAttribute('class', 'atom-google-view')
      var webview = `
         <div class="atom-google-webview-container">
            <webview class="atom-google-webview native-key-bindings"></webview>
         </div>`

      //Add button for refresh and console
      var navbar = `
         <atom-panel class="padded atom-google-navbar native-key-bindings">
            <button id="atom-browser-backbutton" class="btn icon icon-chevron-left inline-block-tight"></button>
            <button id="atom-browser-refreshButton" class="btn icon icon-sync inline-block-tight"></button>
            <div class='tooltip bottom'>
               <div class='tooltip-arrow'></div>
                  <div class='tooltip-inner'>
                       Refresh <span class="keystroke">cmd-shift-r</span>
                  </div>
               </div>
            </div>
            <input class="input-text native-key-bindings" type="text" placeholder="Text">
            <button id="atom-browser-devtools" class="btn icon icon-gear inline-block-tight"></button>
         </atom-panel>
      `;

      //Append the html
      view.innerHTML += webview
      view.innerHTML += navbar

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

      //When a page loads maybe render some markdown?
      // this.webview.addEventListener('dom-ready', function(){
      //    console.log('dom-ready')
      //    if(this.src.indexOf('.md') > 0){
      //       that = this
      //       var pageHTML = this.executeJavaScript(`document.getElementsByTagName('pre')[0].innerHTML`, false, function(innerHTML){
      //          console.log(innerHTML)
      //          var html = markdown.toHTML( innerHTML )
      //          console.log(html)
      //          that.src = `data:text/html,${html}`
      //       })
      //    }
      // })

      var that = this
      //URL Bar
      this.urlbar.addEventListener('keyup', function(e){
         if(e.key == 'Enter')
            that.setURL(this.value)

      })

      //Button Events Back/Reload/Tools
      this.reloadbtn.addEventListener('click', () => { this.reload() })
      this.backbtn.addEventListener('click', () => { this.back() })
      this.devtoolsbtn.addEventListener('click', () => { this.devtools() })

      this.webviewevents()
   }
   webviewevents(){
      var that = this
      this.webview.addEventListener('did-start-loading', function(){
         that.reloadbtn.classList.add('loading')
      })

      this.webview.addEventListener('did-stop-loading', function(){
         that.reloadbtn.classList.remove('loading')
      })
   }
   createUserInput(){
      //Create a Input Add some attributes
      this.input = document.createElement('input')
      this.input.setAttribute('class', 'input-search atom-web-input native-key-bindings')
      this.input.setAttribute('type', 'text')
      this.input.setAttribute('placeholder', 'Search google')

      //Listen for enter key
      var that = this
      this.input.addEventListener('keyup', function(e){
         switch(e.key){
            case 'Enter':
               that.search(this.value)
               this.value = ''
               break
            case 'Escape':
               that.hideSearch()
               break
         }
      })
   }

   search(search){
      const searchURL = 'https://www.google.com/#q='+search
      this.setURL(searchURL)
      this.hideSearch()
      atom.workspace.open(this.view);
   }
   preview(path){
      const fileURL = 'file:///'+path
      this.setURL(fileURL)
      this.hideSearch()
      atom.workspace.open(this.view)
   }
   reload(){
      this.webview.reload()
   }
   back(){
      if(this.webview.canGoBack())
         this.webview.goBack()
   }
   devtools(){
      (this.webview.isDevToolsOpened())
         ? this.webview.closeDevTools()
         : this.webview.openDevTools()
   }

   setURL(url){
      console.log('Setting URL: ' + url)


      //Fix url
      //Search google
      if(url.indexOf(' ') >= 0 || url.indexOf(' ') < 0 && url.indexOf('.') < 0)
         url = 'https://www.google.com/#q='+url
      //Add http://
      if(url.indexOf('http://') < 0 && url.indexOf('https://') < 0 && url.indexOf('file://') < 0)
         url = 'http://' + url


      this.urlbar.value = url;
      this.webview.src = ''
      this.webview.src = this.urlbar.value

   }

   hideSearch(){
      this.modalPanel.hide()
   }

   destroy() {
      this.view.remove();
   }
}
