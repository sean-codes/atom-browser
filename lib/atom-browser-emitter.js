// passed into webview preload
;(() => {
   window.atomBrowserConnectEmitter = {
      interval: undefined,
      ws: undefined,
      port: 0,
      info: {},
      setup: function(port, currentIframeInfo) {
         this.port = port
         this.info = currentIframeInfo

         this.connect()
         this.load()
      },

      connect: function() {
         // console.log('[ATOM BROWSER] connecting emitter')
         this.ws = new WebSocket(`ws://127.0.0.1:${this.port}`)
         this.ws.onopen = () => {
            // console.log('[ATOM BROWSER] emitter connected!')
            this.interval = setInterval(() => this.send(), 500)
         }

         this.ws.onrror = () => {
            console.log('[ATOM BROWSER] could not connect!')
            clearInterval(this.interval)
         }
      },

      load: function() {
         // console.log('[ATOM BROWSER] loading emitter')
         if (document.readyState === "complete") this.onload()
         else window.addEventListener('load', this.onload)
      },

      onload: function() {
         if (window.location.href === this.info.url) {
            window.scrollTo(0, this.info.scrollY)
         }
      },

      send: function() {
         this.ws.send(JSON.stringify({
            url: window.location.href,
            scrollY: window.scrollY
         }))
      },
   }
})();
