'use babel';
import AtomBrowserView from './atom-browser-view'
import { CompositeDisposable } from 'atom'

const CONFIG_WEBVIEW_BACKGROUND = 'atom-browser.viewShowBackground'
const CONFIG_DEFAULT_LOCATION = 'atom-browser.viewDefaultLocation'
const CONFIG_INITIAL_URL = 'atom-browser.initial_url'

export default {
   subscriptions: null,
   dockLocation: 'bottom',
   initialUrl: '',

   deactivate() {
      this.subscriptions.dispose()
      this.end()
   },

   activate() {
      this.addSubscriptions()
   },

   /*------------------------------------------------------------------------*/
   /*---------------------------| subscriptions |----------------------------*/
   /*------------------------------------------------------------------------*/
   addSubscriptions() {
      this.subscriptions = new CompositeDisposable();
      this.subscriptions.add(
         atom.commands.add('atom-workspace', {
            'atom-browser:showHide': () => this.showHide(),
         }),
         atom.config.onDidChange(CONFIG_DEFAULT_LOCATION, () => this.changeConfigDefaultLocation()),
         atom.config.onDidChange(CONFIG_WEBVIEW_BACKGROUND, () => this.changeConfigWebviewBackground()),
         atom.config.onDidChange(CONFIG_WEBVIEW_BACKGROUND, () => this.changeConfigInitialUrl()),
         atom.workspace.getRightDock().getPanes()[0].onWillDestroyItem((e) => this.onDestroyItem(e)),
         atom.workspace.getBottomDock().getPanes()[0].onWillDestroyItem((e) => this.onDestroyItem(e)),
      )
   },

   initializeView(opened) {
      this.dockLocation = atom.config.get(CONFIG_DEFAULT_LOCATION) || this.dockLocation
      this.showBackground = atom.config.get(CONFIG_WEBVIEW_BACKGROUND)
      this.initialUrl = atom.config.get(CONFIG_INITIAL_URL)

      this.view = new AtomBrowserView({
         defaultLocation: this.dockLocation,
         showBackground: this.showBackground,
         initialUrl: this.initialUrl,
      })

      atom.workspace.open(this.view)
      this.changeConfigDefaultLocation()
   },

   /*------------------------------------------------------------------------*/
   /*--------------------------------| config |------------------------------*/
   /*------------------------------------------------------------------------*/
   changeConfigDefaultLocation() {
      var wasVisibleBeforeMoving = this.isOpened()
      var oldLocation = this.dockLocation
      var newLocation = atom.config.get(CONFIG_DEFAULT_LOCATION)
      this.dockLocation = newLocation
      var newDock = this.getDock()

      atom.workspace.getPaneItems().forEach(item => {
         if (item instanceof AtomBrowserView) {

            var oldPane = atom.workspace.paneForItem(item)
            var newPane = newDock.getPanes()[0]
            oldPane.moveItemToPane(item, newPane, 0)
            newPane.activateItem(item)

            if (wasVisibleBeforeMoving) this.getDock().show()
         }
      })
   },

   changeConfigWebviewBackground() {
      const showBackground = atom.config.get(CONFIG_WEBVIEW_BACKGROUND)
      this.view.applySettingViewBackground(showBackground)
   },

   changeConfigInitialUrl() {
      this.initialUrl = atom.config.get(CONFIG_INITIAL_URL)
   },

   /*------------------------------------------------------------------------*/
   /*----------------------------| dock control |----------------------------*/
   /*------------------------------------------------------------------------*/
   showHide() {
      if (!this.view) {
         this.initializeView()
      } else {
         var dock = this.getDock()
         dock.toggle()
      }
   },

   getDock() {
      if (this.dockLocation === 'right') return atom.workspace.getRightDock()
      if (this.dockLocation === 'bottom') return atom.workspace.getBottomDock()
   },

   isOpened() {
      return (this.getDock().state.visible && this.view) ? true : false
   },

   onDestroyItem({ item }) {
      if (item instanceof AtomBrowserView) {
         this.view = undefined
      }
   },
}
