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

process.env.DEBUG = 'actions-on-google:*';
let Assistant = require('actions-on-google').ApiAiAssistant;
let express = require('express');
let bodyParser = require('body-parser');

let app = express();
app.use(bodyParser.json({type: 'application/json'}));

const TEST_ACTION = 'test_action';
const WELCOME_ACTION = 'welcome_action';
const PARSE_ACTION = 'parse_action';
//  Save the array of welcome messages;
//  The first one will return a special context
let Welcomes = [];
Welcomes.push("Hey, there, come on in!");
//Welcomes.push('<speak>Hey, dude. <break time="1s" /> Oh. <break time="1s" /> Nah, I\'m not busy.<break time="1s" /> Come on in!</speak>');
// Welcomes.push('Hey, I\'m Brian... I hear you\'re having trouble writing. What can I help you with\?');
// Welcomes.push('Hey, dude... I\'m Brian... are you having trouble with your writing? Hit me up... hwat are you trying to do?');
// Welcomes.push('Hey, dude, this is the fourth welcome');

const SECONDARY_WELCOME = 'Oh, whoa, sorry... I totally forgot I was in here. Ok, so, what can I help you with?';

// [START SillyNameMaker]
app.post('/', function (req, res) {
  const assistant = new Assistant({request: req, response: res});
  console.log('Request headers: ' + JSON.stringify(req.headers));
  console.log('Request body: ' + JSON.stringify(req.body));

  // Make a silly name
  function makeName (assistant) {
    let number = assistant.getArgument(NUMBER_ARGUMENT);
    let color = assistant.getArgument(COLOR_ARGUMENT);
    assistant.tell('Alright, your silly name is ' +
      color + ' ' + number +
      '! I hope you like it. See you next time.');
  }

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

  //  Figure out which type of block the writer's suffering
  function identifyType(assistant) {
    console.log(assistant.data);
    assistant.tell('Awesome, I have that type');
  }

  function testResponse(assistant) {
    assistant.tell('I\'m trying to get some sweet rhymes for you, and I\'m totally on the backend.');
  }



  let actionMap = new Map();
  actionMap.set(TEST_ACTION, testResponse);
  actionMap.set(WELCOME_ACTION, welcome);
  actionMap.set(PARSE_ACTION, identifyType);

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
