const fs = require('fs');

// appsscript.jsonをdistフォルダにコピー
fs.copyFileSync('appsscript.json', 'dist/appsscript.json'); 