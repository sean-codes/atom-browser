const Quote = require('inspirational-quotes');

module.exports = () => {
   let quote = Quote.getQuote()

   return  `
      <div class="atombrowser-webview-container">
         <webview id="atombrowser-webview" preload="file:${__dirname}/../lib/atom-browser-emitter.js" class="native-key-bindings" src=""></webview>
         <div id="atombrowser-webview-failed-load">
            <i class="icon icon-octoface"></i>
            <h4 class="message">
               "${quote.text}"<br>
               <small>- ${quote.author}</small>
            </h4>
         </div>
      </div>
   `.trim()
}
