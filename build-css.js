var fs = require('fs')
fs.createReadStream('./src/style.css').pipe(fs.createWriteStream('./dist/style.css'))