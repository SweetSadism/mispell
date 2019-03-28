//import data from './data.js'
//import nearly from 'nearly'
const data = require('./data.js')
const dict = data.dict
const pluralize = require('pluralize')
const nlp = require('compromise')

//console.log(dict)

/**
 * @param {double} bf - BimboFactor, a value between 0 and 1 describing the current level of bimbofication.
 */
function bimbofy(text, bf) {
   // Replace curly quotes in text
   text = text.replace(/[\u2018\u2019]/g, "'").replace(/[\u201C\u201D]/g, '"');

   // NATURAL LANGUAGE PROCESSING LIBRARY
   // Spell out numbers
   let doc = nlp(text)
   if (bf > 0.5) {
      //doc.values().toText()
   }
   if (bf > 0.5) {
      doc.contractions().contract()
   }
   {
      let rand = Math.random()
      // Of everything that is not a verb at end of sentence, pick all verbs
      doc.not('#Verb$').match('#Verb').forEach((match) => {
         if (Math.random() < 0.7 * bf) {
            let rw = pickRandomWeighted([
               {spelling: ', like,', weight: 1},
               {spelling: ', kinda', weight: 0.3},
               {spelling: ', sorta', weight: 0.3},
               {spelling: ', like whatever,', weight: 0.3}
            ]).spelling
            match.setPunctuation(rw)//.insertAfter(rw);
         }
      })
      doc.adjectives().forEach((match) => {
         // Don't insert before words beginning with quotation marks
         if (match.data()[0].text.charAt(0) != '"') {
            //console.log("Ye:", match.data()[0].text);
            let rw = pickRandomWeighted([
               {spelling: 'literally', weight: 0.5},
               {spelling: 'totally', weight: 1},
               {spelling: 'actually', weight: 1},
               {spelling: 'basically', weight: 1},
               {spelling: 'absolutely', weight: 1},
               {spelling: 'you know,', weight: 1}
            ]).spelling
            let rw2 = pickRandomWeighted([
               {spelling: 'um', weight: 0.4},
               {spelling: 'uh,', weight: 1}
            ]).spelling

            if (Math.random() < 0.2 * bf) {
               match.insertBefore(rw2);
            }
            if (Math.random() < 0.8 * bf) {
               match.insertBefore(rw);
            }
         }
      })
      /*doc.adjectives().filter(() => {
         return Math.random() < 0.25 * bf}).insertBefore('literally')*/
      //console.log(doc.verbs().data());
   }
   text = doc.out('text')

   // MANUAL PROCESSING
   // Split text on word boundaries
   let words = text.split(/\b/g)

   // Iterate over all words
   for (let i = 0; i < words.length; i++){
      // PREPARATION
      let word = words[i]

      /*if (word === "'" && words[i+1] == "s") {
         words[i] = " "
         words[i+1] = "is"
         continue
      }*/

      // Remove capitalization. Save it for later.
      let capitalLetter = false
      if (word[0] === word[0].toUpperCase()) capitalLetter = true
      word = word.toLowerCase()

      // Remove plural form
      let isSingular = false;
      let singular = pluralize(word, 1)
      if (singular === word) isSingular = true
      if (word !== "s") word = singular //Ignore lonely 's or they are removed


      // If there is a misspelling, maybe misspell it
      if (Math.random() < 0.5 * bf) {
         // DICTIONARY MISSPELLING
         word = pickSpelling(word)

         // Replace underscores in dict with spaces
         word = word.replace('_', ' ')

      }
      if (Math.random() < 0.5 * bf) {
         // REGEXP MISSPELLING
         word = removeDuplicateChars(word)
      }

      // RESTORE
      // Restore capital letter if any
      if (capitalLetter) word = word.charAt(0).toUpperCase() + word.slice(1)
      // Restore pluralization
      if (!isSingular) word = pluralize(word, 2)

      // Write back
      words[i] = word
   }
   //console.log(removeDuplicateChars("summation"));

   return words.join('')
}

console.log(bimbofy(data.text2, 1));

function pickSpelling(word) {
   if (!(word in dict)) return word
   let entry = dict[word]

   if (entry[0].constructor == Object) {
      let picked = pickRandomWeighted(entry)
      if ('synonym' in picked) {
         return pickSpelling(picked.synonym)
      }
      return picked.spelling
   } else { // Or not weighted, if word.constructor == String
      let index = Math.floor(Math.random() * dict[word].length)
      return entry[index]
   }
}

function pickRandomWeighted(weightedList) {
   let totalWeight = 0;
   for (let i = 0; i < weightedList.length; i++) {
      if (!("weight" in weightedList[i])) weightedList[i].weight = 1
      totalWeight += weightedList[i].weight
   }
   let rand = Math.random() * totalWeight
   for (let i = 0; i < weightedList.length; i++) {
      rand -= weightedList[i].weight
      if (rand < 0) return weightedList[i]
   }
   throw("Error picking a random weighted element.")
}

function pickRandom(list) {
   return list[Math.floor(Math.random()*list.length)];
}

function removeDuplicateChars(string) {
   lastChar = ""
   output = ""
   for (let i = 0; i < string.length; i++) {
      if (lastChar !== string.charAt(i)) {
         output += string.charAt(i)
         lastChar = string.charAt(i)
      }
   }
   //console.log(string, "->", output);
   return output
}

/* Unneccessary words to add
actually
like
honestly
literally
really
totally
uh
um
whatever
you know

fabulous
*/