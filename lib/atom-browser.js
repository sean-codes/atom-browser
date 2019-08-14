'use babel';
import { CompositeDisposable } from 'atom'
import AtomBrowserViewBrowser from './atom-browser-view-browser'
import AtomBrowserViewIcon from './atom-browser-view-icon'

const CONFIG_WEBVIEW_BACKGROUND = 'atom-browser.showBackground'
const CONFIG_DEFAULT_LOCATION = 'atom-browser.defaultLocation'
const CONFIG_INITIAL_URL = 'atom-browser.initialUrl'
const CONFIG_SHOW_ICON = 'atom-browser.showIcon'

export default {
   subscriptions: null,
   dockLocation: 'bottom',
   initialUrl: '',
   showIcon: false,
   view: undefined,
   showBackground: false,

   deactivate() {
      this.subscriptions.dispose()
      this.icon && this.icon.destroy()
      this.view && this.view.destroy()
   },

   activate() {
      this.addSubscriptions()
   },

   consumeStatusBar(statusBar) {
      this.statusBar = statusBar
      this.toggleIcon()
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
         atom.config.onDidChange(CONFIG_SHOW_ICON, () => this.changeConfigShowIcon()),
         atom.workspace.getRightDock().getPanes()[0].onWillDestroyItem((e) => this.onDestroyItem(e)),
         atom.workspace.getBottomDock().getPanes()[0].onWillDestroyItem((e) => this.onDestroyItem(e)),
      )
   },

   toggleIcon() {
      this.showIcon = atom.config.get(CONFIG_SHOW_ICON)

      if (this.showIcon) {
         this.icon = new AtomBrowserViewIcon({ onClick: this.showHide.bind(this) } )
         this.statusBar.addRightTile({
            item: this.icon.element,
            priority: -999
         })
      } else {
         if (this.icon) {
            this.icon.destroy()
            this.icon = undefined
         }
      }
   },

   initializeView() {
      this.dockLocation = atom.config.get(CONFIG_DEFAULT_LOCATION) || this.dockLocation
      this.showBackground = atom.config.get(CONFIG_WEBVIEW_BACKGROUND)
      this.initialUrl = atom.config.get(CONFIG_INITIAL_URL)

      this.view = new AtomBrowserViewBrowser({
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
         if (item instanceof AtomBrowserViewBrowser) {

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
      this.view && this.view.applySettingViewBackground(showBackground)
   },

   changeConfigInitialUrl() {
      this.initialUrl = atom.config.get(CONFIG_INITIAL_URL)
   },

   changeConfigShowIcon() {
      this.toggleIcon()
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
