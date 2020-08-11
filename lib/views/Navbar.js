module.exports = ({ reloadByDefault }) => {
   return  `
      <atom-panel id="atombrowser-navbar" class="padded native-key-bindings">

         <!-- back / reload / refresh-on-save -->
         <button id="atombrowser-btn-back" class="btn"><i class="icon icon-chevron-left"></i></button>
         <button id="atombrowser-btn-reload" class="btn"><i class="icon icon-sync"></i></button>
         <button id="atombrowser-btn-livereload" class="btn ${reloadByDefault ? 'active' : ''}"><i class="icon icon-zap"></i></button>

         <!-- addressbar -->
         <input type="text" id="atombrowser-addressbar" class="input-text native-key-bindings" placeholder="Search, File, Url"/>

         <!-- open devtools -->
         <button id="atombrowser-btn-devtools" class="btn"><i class="icon icon-terminal"></i></button>

      </atom-panel>
   `.trim()
}
