var request = require('request');

module.exports = {

    rhyme: function (_word, callback) {

        request('http://rhymebrain.com/talk?function=getRhymes&word=' + _word, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                var mRhymes = JSON.parse(body);
                var mGoodRhymes = [];

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


