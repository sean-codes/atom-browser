'use babel';
import { CompositeDisposable } from 'atom'
import AtomBrowserViewBrowser from './atom-browser-view-browser'
import AtomBrowserViewIcon from './atom-browser-view-icon'

import {
   CONFIG_WEBVIEW_BACKGROUND,
   CONFIG_DEFAULT_LOCATION,
   CONFIG_INITIAL_URL,
   CONFIG_SHOW_ICON,
} from './atom-browser-confignames'

export default {
   activate() {
      this.subscriptions = null
      this.dockLocation = 'bottom'
      this.initialUrl = ''
      this.showIcon = false
      this.view = undefined
      this.showBackground = false
      this.addSubscriptions()
   },

   consumeStatusBar(statusBar) {
      this.statusBar = statusBar
      this.toggleIcon()
   },

   deactivate() {
      this.subscriptions.dispose()
      this.icon && this.icon.destroy()
      this.view && this.view.destroy()
      var pane = this.getPane()
      var item = this.getItem()
      if (pane && item) {
         pane.destroyItem(item)
      }
   },

   /*------------------------------------------------------------------------*/
   /*---------------------------| subscriptions |----------------------------*/
   /*------------------------------------------------------------------------*/
   addSubscriptions() {
      this.subscriptions = new CompositeDisposable();
      this.subscriptions.add(
         atom.commands.add('atom-workspace', {
            'atom-browser:preview': () => this.onPreview(),
            'atom-browser:show': () => this.show(),
            'atom-browser:hide': () => this.hide(),
            'atom-browser:showHide': () => this.toggle(),
         }),
         atom.config.onDidChange(CONFIG_DEFAULT_LOCATION, () => this.changeConfigDefaultLocation()),
         atom.config.onDidChange(CONFIG_WEBVIEW_BACKGROUND, () => this.changeConfigWebviewBackground()),
         atom.config.onDidChange(CONFIG_WEBVIEW_BACKGROUND, () => this.changeConfigInitialUrl()),
         atom.config.onDidChange(CONFIG_SHOW_ICON, () => this.changeConfigShowIcon()),
         atom.workspace.getRightDock().getPanes()[0].onWillDestroyItem((e) => this.onDestroyItem(e)),
         atom.workspace.getBottomDock().getPanes()[0].onWillDestroyItem((e) => this.onDestroyItem(e)),
         atom.workspace.getRightDock().getPanes()[0].onDidAddItem((e) => this.onDidMoveItem(e, 'right')),
         atom.workspace.getBottomDock().getPanes()[0].onDidAddItem((e) => this.onDidMoveItem(e, 'bottom')),
      )
   },

   onPreview() {
      this.show()
      // get the selected path
      var selected = document.querySelector('.atom-dock-inner .selected .name')
      if (!selected) return

      var path = selected.getAttribute('data-path')
      const fileURL = 'file:///' + path

      this.view.setURL(fileURL)
   },

   /*------------------------------------------------------------------------*/
   /*---------------------------------| views |------------------------------*/
   /*------------------------------------------------------------------------*/
   toggleIcon() {
      this.showIcon = atom.config.get(CONFIG_SHOW_ICON)

      if (this.showIcon) {
         this.icon = new AtomBrowserViewIcon({ onClick: this.toggle.bind(this) })
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

      if (oldLocation === newLocation) return

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
   toggle() {
      this.isOpened() ? this.hide() : this.show()
   },

   show() {
      if (!this.view || !this.view.isInDom()) {
         this.initializeView()
      }

      var dock = this.getDock()
      dock.show()
   },

   hide() {
      var dock = this.getDock()
      dock.hide()
   },

   getDock() {
      if (this.dockLocation === 'right') return atom.workspace.getRightDock()
      if (this.dockLocation === 'bottom') return atom.workspace.getBottomDock()
   },

   getPane() {
      return this.getDock().getPanes()[0]
      return pane
   },

   getItem() {
      return this.getPane().items.find((item) => {
         return (item instanceof AtomBrowserViewBrowser) ? true : false
      })
   },

   isOpened() {
      return (
         this.getDock().state.visible
         && this.view
         && this.view.isInDom()
      ) ? true : false
   },

   onDestroyItem({ item }) {
      if (item instanceof AtomBrowserViewBrowser) {
         this.view = undefined
      }
   },

   onDidMoveItem({ item }, location) {
      this.dockLocation = location
      atom.config.set(CONFIG_DEFAULT_LOCATION, location)
   },
}
