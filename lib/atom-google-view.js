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
      var createWebView = document.createElement('webview')
      createWebView.setAttribute('class', 'atom-google-webview native-key-bindings')
      this.webView = {
         element: createWebView,
         getTitle: () => 'Google Search',
         getURI: () => 'atom://atom-google/webview',
         getDefaultLocation: () => 'bottom'
      }
      console.log(this.webView)
   }

   createUserInput(){
      //Create a Input Add some attributes
      this.input = document.createElement('input')
      this.input.setAttribute('class', 'input-search atom-google-input native-key-bindings')
      this.input.setAttribute('type', 'text')
      this.input.setAttribute('placeholder', 'Atom Google Search')

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
