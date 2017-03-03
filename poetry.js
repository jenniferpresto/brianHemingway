var request = require('request');

module.exports = {

    rhyme: function (_word, _maxCount, callback) {

        var word = _word.toLowerCase();

        request('http://rhymebrain.com/talk?function=getRhymes&word=' + word, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                var mRhymes = JSON.parse(body);
                var mGoodRhymes = [];

                for(var i=0;i< mRhymes.length; i++){
                    if(mRhymes[i].score >= 300){
                        mGoodRhymes.push(mRhymes[i].word);
                    }
                }
                // console.log("good rhyme count: "+mGoodRhymes.length + ", but i'm requesting only " + _maxCount);


                while(mGoodRhymes.length>_maxCount){
                    var len = mGoodRhymes.length-1;
                    var rand = module.exports.getRandomIntInclusive(0,len);
                    mGoodRhymes.splice(rand,1);
                }

                callback(mGoodRhymes);
            }
        });

        return 0;

    },
    getRandomIntInclusive: function(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
};


