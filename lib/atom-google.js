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
   },

   toggle(open=false) {
      if(atom.workspace.getBottomDock().state.visible && open==false){
         atom.workspace.getBottomDock().hide()
         this.view.modalPanel.hide()
      } else {
         this.view.modalPanel.show()
         this.view.input.focus()
      }
   },
   preview() {
      var path = document.querySelector('.atom-dock-inner .tree-view .list-item.selected .name').getAttribute('data-path')
      this.view.preview(path)
   }
}
