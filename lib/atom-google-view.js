'use babel';

//New Wave Javascript! Classy!
export default class AtomGoogleView {

   constructor(serializedState) {
      //Create a webview and input
      this.createWebView();
      this.createUserInput()

      //Append and Ready Dock/Modal
      this.readyModal()

      //Add button for refresh and console
      var btnHTML = `<button class='btn icon icon-gear inline-block-tight'>Settings</button>`;

   }

   readyModal(){
      //Create the Modal
      this.modalPanel = atom.workspace.addModalPanel({ item: this.input, visible: false });
   }

   createWebView(){
      var createWebView = document.createElement('webview')
      createWebView.setAttribute('class', 'atom-google-webview native-key-bindings')
      this.webView = {
         element: createWebView,
         getTitle: () => 'Atom Web',
         getURI: () => 'atom://atom-web/webview',
         getDefaultLocation: () => 'bottom'
      }
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
      atom.workspace.open(this.webView);
   }
   preview(path){
      const fileURL = 'file:///'+path
      this.setURL(fileURL)
      this.hideSearch()
      atom.workspace.open(this.webView);
      var that = this
      this.webView.element.addEventListener('dom-ready', function(){
         that.webView.element.openDevTools()
      })
   }
   reload(){
      this.webView.element.reload()
   }
   devtools(){
      (this.webView.element.isDevToolsOpened())
         ? this.webView.element.closeDevTools()
         : this.webView.element.openDevTools()
   }
   setURL(url){
     this.webView.element.src=url
   }

   hideSearch(){
      this.modalPanel.hide()
   }
   // Tear down any state and detach
   destroy() {
      this.webView.remove();
   }
}
