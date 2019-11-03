module.exports = () => {
   return  `
      <div class="atombrowser-webview-container">
         <webview id="atombrowser-webview" preload="file:${__dirname}/../lib/atom-browser-emitter.js" class="native-key-bindings" src="" />
      </div>
   `.trim()
}
