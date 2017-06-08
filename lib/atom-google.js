'use babel';

import AtomGoogleView from './atom-google-view';
import { CompositeDisposable } from 'atom';

export default {
   googleSideView: null,
   modalPanel: null,
   subscriptions: null,

   deactivate() {
      this.html.destroy();
   },

   activate(state) {
      //Create the view
      this.view = new AtomGoogleView(state.AtomGoogleViewState)
      this.setUpGlobalCommands()
   },

   setUpGlobalCommands(){
      // We use this because when we deactivate the plugin we dont want to use all of this
      this.subscriptions = new CompositeDisposable();
      this.subscriptions.add(atom.commands.add('atom-workspace', {
         'atom-google:toggle': () => this.toggle()
      }))
      this.subscriptions.add(atom.commands.add('atom-workspace', {
         'atom-google:preview': () => this.preview()
      }))
      this.subscriptions.add(atom.commands.add('atom-workspace', {
         'atom-google:reload': () => this.reload()
      }))
      this.subscriptions.add(atom.commands.add('atom-workspace', {
         'atom-google:devtools': () => this.devtools()
      }))
      this.subscriptions.add(atom.commands.add('atom-workspace', {
         'atom-google:showHide': () => this.showHide()
      }))
   },

   toggle(toggle=false) {
      if(atom.workspace.getBottomDock().state.visible && toggle == false){
         atom.workspace.getBottomDock().hide()
         this.view.modalPanel.hide()
      } else {
         this.view.modalPanel.show()
         this.view.input.focus()
      }
   },
   showHide(){
      if(atom.workspace.getBottomDock().state.visible){
         atom.workspace.getBottomDock().hide()
      } else {
         atom.workspace.getBottomDock().show()
         atom.workspace.open(this.view.view)
      }
   },
   preview() {
      var path = document.querySelector('.atom-dock-inner .tree-view .list-item.selected .name').getAttribute('data-path')
      this.toggle(true)
      this.view.preview(path)
   },
   reload(){
      this.view.reload()
   },
   devtools(){
      this.view.devtools()
   }
}
