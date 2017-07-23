'use babel';
//New Wave Javascript! Classy!
const fs = require('fs')
const pathPackage = atom.packages.resolvePackagePath('atom-browser')
function getTemplate(name){
   var path = pathPackage + `/templates/${name}.html`
   var template = document.createElement('template');
   template.innerHTML = fs.readFileSync(path, "utf8");
   return template.content.firstChild;
}

const viewSettings = [
   {
      name: 'atom-browser.viewShowBackground',
      element: 'webview',
      class: 'showBackground'
   }
]

//Get the html templates
const viewElements = {
   webview : getTemplate('webview'),
   navbar : getTemplate('navbar'),
   tabs : getTemplate('tabs')
}

export default class AtomGoogleView {

   /*------------------------------------------------------------------------*/
   /*---------------------------| CONSTRUCTOR |------------------------------*/
   /*------------------------------------------------------------------------*/
   constructor(serializedState) {
      this.loadAndWatchViewSettings()

      //Create the view
      var view = document.createElement('div')
      view.setAttribute('id', 'atombrowser-view')

      // Load settings

      //Append the html and make a workspace
      view.appendChild(viewElements.webview)
      view.appendChild(viewElements.navbar)

      //view.innerHTML += tabs
      this.workspace = {
         element: view,
         getTitle: () => 'Atom Browser',
         getURI: () => 'atom://atom-web/webview',
         getDefaultLocation: () => 'bottom'
      }

      //Select this html for later
      this.html = {
         webview: view.querySelector('#atombrowser-webview'),
         addressbar: viewElements.navbar,
         //tabs: view.querySelector('#atombrowser-tabs'),
         btn: {
            reload: view.querySelector('#atombrowser-btn-reload'),
            back: view.querySelector('#atombrowser-btn-back'),
            devtools: view.querySelector('#atombrowser-btn-devtools'),
            livereload: view.querySelector('#atombrowser-btn-livereload'),
            tabs: view.querySelector('#atombrowser-btn-tabs')
         }
      }
   }

   loadAndWatchViewSettings(){
      // Loop the settings and toggle on or off
      for(var setting of viewSettings){
            if(!setting.listening) this.watchSetting(setting)

            var value = atom.config.get(setting.name)
            var element = viewElements[setting.element]
            element.classList.toggle(setting.class, value)
      }
   }

   watchSetting(setting){
      atom.config.onDidChange(setting.name, this.loadAndWatchViewSettings)
      setting.listening = true
   }
}
