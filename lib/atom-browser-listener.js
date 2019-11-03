'use babel';
import { CompositeDisposable } from 'atom'

const WebSocket = require('ws');

import {
   CONFIG_EMITTER_PORT,
} from './atom-browser-confignames'

export default class AtomBrowserListener{
   constructor({ browser, onEvent }) {
      this.browser = browser
      this.onEvent = onEvent
      this.wss = undefined
   }

   listen() {
      this.wss = new WebSocket.Server({ port: atom.config.get(CONFIG_EMITTER_PORT) });

      this.wss.on('connection', (ws) => {
        ws.on('message', (message) => {
          this.onEvent(JSON.parse(message))
        })
      })

      console.log('[ATOM BROWSER] listening on ', atom.config.get(CONFIG_EMITTER_PORT))
   }

   destroy() {
      if (this.wss) this.wss.close()
   }
}
