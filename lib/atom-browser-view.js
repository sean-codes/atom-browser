'use babel';
//New Wave Javascript! Classy!
const fs = require('fs')
const pathPackage = atom.packages.resolvePackagePath('atom-browser')

const viewSettings = [
   {
      name: 'atom-browser.viewShowBackground',
      element: 'webview',
      class: 'showBackground'
   }
]



export default class AtomGoogleView {

   /*------------------------------------------------------------------------*/
   /*---------------------------| CONSTRUCTOR |------------------------------*/
   /*------------------------------------------------------------------------*/
   constructor(serializedState) {
      //Get the html templates
      this.elements = {
         webview : this.loadTemplate('webview')[0],
         navbar : this.loadTemplate('navbar')[0],
         tabs : this.loadTemplate('tabs')[0]
      }

      // Load settings
      this.loadAndWatchViewSettings()

      //Create the view
      this.view = document.createElement('div')
      this.view.setAttribute('id', 'atombrowser-view')


      //Append the html and make a workspace
      this.view.appendChild(this.elements.webview)
      this.view.appendChild(this.elements.navbar)

      //view.innerHTML += tabs
      this.workspace = {
         element: this.view,
         getTitle: () => 'Atom Browser',
         getURI: () => 'atom://atom-web/webview',
         getDefaultLocation: () => 'bottom'
      }

      //Select this html for later
      this.setHTML()
   }

   setHTML(){
      this.html = {
         webview: this.view.querySelector('#atombrowser-webview'),
         addressbar: this.view.querySelector('#atombrowser-addressbar'),
         //tabs: view.querySelector('#atombrowser-tabs'),
         btn: {
            reload: this.view.querySelector('#atombrowser-btn-reload'),
            back: this.view.querySelector('#atombrowser-btn-back'),
            devtools: this.view.querySelector('#atombrowser-btn-devtools'),
            livereload: this.view.querySelector('#atombrowser-btn-livereload'),
            tabs: this.view.querySelector('#atombrowser-btn-tabs')
         }
      }
   }
   loadAndWatchViewSettings(){
      // Loop the settings and toggle on or off
      for(var setting of viewSettings){
            if(!setting.listening) this.watchSetting(setting)

            var value = atom.config.get(setting.name)
            var element = this.elements[setting.element]
            element.classList.toggle(setting.class, value)
      }
   }

   watchSetting(setting){
      atom.config.onDidChange(setting.name, () => { this.loadAndWatchViewSettings() })
      setting.listening = true
   }

   loadTemplate(name){
      var path = pathPackage + `/templates/${name}.json`
      var template = JSON.parse(fs.readFileSync(path, "utf8"))
      return this.parseTemplate(template)
   }

   parseTemplate(template){
      var newElements = []
      for(var ele of template){
         var newElement = document.createElement(ele.type)

         // Set the attributes
         if(!ele.attributes) ele.attributes = {}
         for(var attributeName of Object.keys(ele.attributes)){
            var value = ele.attributes[attributeName]
            newElement.setAttribute(attributeName, value)
         }

         // Set the innerHTML
         if(ele.innerHTML === undefined) ele.innerHTML = ''
         if(typeof ele.innerHTML === 'string'){
            newElement.innerHTML = ele.innerHTML
         } else {
            var innerHTMLElements = this.parseTemplate(ele.innerHTML)
            for(var innerEle of innerHTMLElements)
               newElement.appendChild(innerEle)
         }

         newElements.push(newElement)
      }
      return newElements
   }
}
