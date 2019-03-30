const fs = require('fs')

function parseDollarDict(paths) {
   let dict = {}

   for (let j = 0; j < paths.length; j++) {
      let data = fs.readFileSync(paths[j], 'utf8')
      let lines = data.toString().split('\n')
      let word = ""
      for (let i = 0; i < lines.length; i++){
         let line = lines[i]
         if (line.charAt(0) == '$') {
            word = line.substr(1, line.length - 1).toLowerCase()
            if (!(word in dict)) {
               dict[word] = []
            }
         } else {
            dict[word].push(line.substr(0, line.length - 1).toLowerCase())
         }
      }
   }
   //console.log(dict.American);
   fs.writeFileSync('res/dict.json', JSON.stringify(dict, null, 3), 'utf8')
}

// Later dicts will override the values of earlier ones for mutual keys
function buildDict(paths) {
   let dict = {}
   for (let j = 0; j < paths.length; j++) {
      Object.assign(dict, JSON.parse(fs.readFileSync(paths[j])))
   }
   return dict
}

function preProcess() {
   parseDollarDict(['res/wikipedia.dat', 'res/aspell.dat'])
   let finalDict = buildDict(['res/dict.json', 'res/bimbo-names.json', 'res/bimbo-dict.json'])
   fs.writeFileSync('res/finalDict.json', JSON.stringify(finalDict, null, 3), 'utf8')
}

preProcess()
