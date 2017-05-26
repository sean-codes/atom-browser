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
   },
   toggle() {
      if(atom.workspace.getBottomDock().state.visible){
         atom.workspace.getBottomDock().hide()
         this.view.modalPanel.hide()
      } else {
         this.view.modalPanel.show()
         this.view.input.focus()
      }
   }
}
