'use babel';
//New Wave Javascript! Classy!
const fs = require('fs')
const pathPackage = atom.packages.resolvePackagePath('atom-browser')
function getTemplate(name){
   return fs.readFileSync(pathPackage + `/templates/${name}.html`, "utf8");
}

export default class AtomGoogleView {

   /*------------------------------------------------------------------------*/
   /*---------------------------| CONSTRUCTOR |------------------------------*/
   /*------------------------------------------------------------------------*/
   constructor(serializedState) {
      //Create the view
      var view = document.createElement('div')
      view.setAttribute('id', 'atombrowser-view')

      //Get the html templates
      var webview = getTemplate('webview')
      var navbar = getTemplate('navbar')
      var tabs = getTemplate('tabs')

      //Append the html and make a workspace
      view.innerHTML += webview
      view.innerHTML += navbar
      //view.innerHTML += tabs
      this.workspace = {
         element: view,
         getTitle: () => 'Atom Web',
         getURI: () => 'atom://atom-web/webview',
         getDefaultLocation: () => 'bottom'
      }

      //Select this html for later
      this.html = {
         webview: view.querySelector('#atombrowser-webview'),
         addressbar: view.querySelector('#atombrowser-addressbar'),
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
}
