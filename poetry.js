var request = require('request');

//var mRhymes = {};

var wordToRhyme = "cat";
/*
request('http://rhymebrain.com/talk?function=getRhymes&word=' + wordToRhyme, function (error, response, body) {
    if (!error && response.statusCode == 200) {
        mRhymes = JSON.parse(body);

        //console.log(mRhymes);
        //console.log(gimmeFive());
    }
});
function getWordCount(){
    return mRhymes.length;
};

function gimmeFive(){
    var wordList = [];
    if( getWordCount() > 0 ){
        for(var i=0;i< Math.min(getWordCount(),5);i++){
            wordList.push(mRhymes[i].word);
        }
    }
    return wordList;
}


*/

module.exports = {
    rhyme: function (_word, callback) {

        request('http://rhymebrain.com/talk?function=getRhymes&word=' + _word, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                var mRhymes = JSON.parse(body);
                var mGoodRhymes = [];
               // console.log("in the module: " + body + ", " + _word);

                for(var i=0;i<mRhymes.length; i++){
                    if(mRhymes[i].score >= 300){

                        mGoodRhymes.push(mRhymes[i].word);

                    }
                }

                callback(mGoodRhymes);
            }
        });

        return 0;

    }
};


