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
      this.setUpTheKeyBinds()
   },

   setUpTheKeyBinds(){
      // We use this because when we deactivate the plugin we dont want to use all of this
      this.subscriptions = new CompositeDisposable();
      this.subscriptions.add(atom.commands.add('atom-workspace', {
         'atom-google:preview': () => this.preview(),
         'atom-google:reload': () => this.reload(),
         'atom-google:devtools': () => this.devtools(),
         'atom-google:showHide': () => this.showHide()
      }))
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
