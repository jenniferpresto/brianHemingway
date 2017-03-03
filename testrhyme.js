// call this with
// node testrhyme.js {wordtorhyme}
// returns array of rhymes.
'use strict';

var poetry = require('./poetry');

if(process.argv.length>2){
    poetry.rhyme(process.argv[2], 5, function(e){
        console.log(e);
    });
} else {
    console.log("you need to provide a word to rhyme!");
}
