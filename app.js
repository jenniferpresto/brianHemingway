// Copyright 2016, Google, Inc.
// Licensed under the Apache License, Version 2.0 (the 'License');
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an 'AS IS' BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

var poetry = require('./poetry');


process.env.DEBUG = 'actions-on-google:*';
let Assistant = require('actions-on-google').ApiAiAssistant;
let express = require('express');
let bodyParser = require('body-parser');

let app = express();
app.use(bodyParser.json({type: 'application/json'}));

const TEST_ACTION = 'test_action';
const RHYME_ACTION = 'rhymes_with';
const WELCOME_ACTION = 'welcome_action';
const CORRECT_WELCOME_ACTION = 'correct_welcome_action';
const PARSE_ACTION = 'parse_action';

//  Save the array of welcome messages;
//  The first one will return a special context
let Welcomes = [];
Welcomes.push("Hey, there, come on in!");
//Welcomes.push('<speak>Hey, dude. <break time="1s" /> Oh. <break time="1s" /> Nah, I\'m not busy.<break time="1s" /> Come on in!</speak>');
// Welcomes.push('Hey, I\'m Brian... I hear you\'re having trouble writing. What can I help you with\?');
// Welcomes.push('Hey, dude... I\'m Brian... are you having trouble with your writing? Hit me up... hwat are you trying to do?');
// Welcomes.push('Hey, dude, this is the fourth welcome');

const SECONDARY_WELCOME = 'Oh, whoa, sorry... I totally forgot I was in here. Ok, so, what can I help you with? Do you need some rhymes or just general inspiration?';

// [START SillyNameMaker]
app.post('/', function (req, res) {
  const assistant = new Assistant({request: req, response: res});
  console.log('Request headers: ' + JSON.stringify(req.headers));
  console.log('Request body: ' + JSON.stringify(req.body));

  // // Make a silly name
  // function makeName (assistant) {
  //   let number = assistant.getArgument(NUMBER_ARGUMENT);
  //   let color = assistant.getArgument(COLOR_ARGUMENT);
  //   assistant.tell('Alright, your silly name is ' +
  //     color + ' ' + number +
  //     '! I hope you like it. See you next time.');
  // }

  function welcome(assistant) {
    let welcomeIdx = Math.floor((Math.random() * Welcomes.length));
    console.log('Random number for the welcome is' + welcomeIdx);

    //  If Brian is confused and invites you in, set context appropriately
    if (welcomeIdx == 0) {
      console.log('hey, it\'s the beginning');
      assistant.setContext('confused_welcome');

    }
    assistant.ask(Welcomes[welcomeIdx]);
  }

  function correctWelcome(assistant) {
    assistant.ask(SECONDARY_WELCOME);
  }

  function rhymeResponse(assistant){
   // assistant.tell("I'm so cool, I rhyme all the time");
      var word = assistant.getArgument("word_to_rhyme");
      console.log(word);
      poetry.rhyme(word, function(e){
        if(e.length == 0){
          assistant.tell('<speak>Are you trying to be funny? Because nothing rhymes with '+ word+ '.<break time="3s" />  NOTHING!</speak>');
           // assistant.tell('<speak>Step 1, take a deep breath. <break time="2s" />Step 2, exhale. </speak>');
        } else if(e.length == 1) {
          assistant.tell("there's only one word that rhymes with "+word + ". and that is " + e);
        }
        assistant.tell("There are a bunch of words that rhyme with " + word + " like " + e);
      });
  }

  //  Figure out which type of block the writer's suffering
  function identifyType(assistant) {
    //  See if we need a rhyme or general inspiration
    if (assistant.getArgument('block_type') == 'rhyme') {
      assistant.ask('Dude, you just need a push in the right direction for a rhyme! Just let me know what word you\'re trying to rhyme');
    } else if (assistant.getArgument('block_type') == 'general') {
      // assistant.setContext('getting_genre');
      assistant.ask('dude, I can totally hook you up with some general inspiration. Let me know if you what kind of thing you\'re writing.');
    }
  }

  function testResponse(assistant) {
    assistant.tell('I\'m trying to get some sweet rhymes for you, and I\'m totally on the backend.');
  }

  let actionMap = new Map();
  actionMap.set(TEST_ACTION, testResponse);
  actionMap.set(WELCOME_ACTION, welcome);
  actionMap.set(RHYME_ACTION, rhymeResponse);
  actionMap.set(PARSE_ACTION, identifyType);
  actionMap.set(CORRECT_WELCOME_ACTION, correctWelcome);

  assistant.handleRequest(actionMap);
});
// [END SillyNameMaker]

if (module === require.main) {
  // [START server]
  // Start the server
  let server = app.listen(process.env.PORT || 8080, function () {
    let port = server.address().port;
    console.log('App listening on port %s', port);



  });
  // [END server]
}

module.exports = app;
