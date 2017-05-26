'use babel';

export default class AtomGoogleView {

   constructor(serializedState) {
      //Create a webview and input
      this.createWebView();
      this.createUserInput()

      //Append and Ready Dock/Modal
      this.readyModalAndDock()
   }

   readyModalAndDock(){
      //Create the Modal
      this.modalPanel = atom.workspace.addModalPanel({ item: this.input, visible: false });
      //Append Element to dock
      atom.workspace.getBottomDock().element.appendChild(this.webView)
   }

   createWebView(){
      this.webView = document.createElement('webview')
      this.webView.setAttribute('class', 'atom-google-webview native-key-bindings')
   }

   createUserInput(){
      //Create a Input Add some attributes
      this.input = document.createElement('input')
      this.input.setAttribute('class', 'input-search atom-google-input native-key-bindings')
      this.input.setAttribute('type', 'text')
      this.input.setAttribute('placeholder', 'Search Google')

      //Listen for enter key
      var that = this
      this.input.addEventListener('keyup', function(e){
         switch(e.key){
            case 'Enter':
               that.search(this.value)
               this.value = ''
               break
         }
      })
   }

   search(search){
      const searchURL = 'https://www.google.com/#q='+search
      this.setURL(searchURL)
      this.modalPanel.hide()
      atom.workspace.getBottomDock().show()
   }

   setURL(url){
     this.webView.src=url
   }
}
