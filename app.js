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

//const TEST_ACTION = 'test_action';
const RHYME_ACTION = 'rhymes_with';
const WELCOME_ACTION = 'welcome_action';
const CORRECT_WELCOME_ACTION = 'correct_welcome_action';
const PARSE_ACTION = 'parse_action';
const GET_PLOT_ACTION = 'get_plot_line';

let MYSTERY_PLOTLINES = [];
let COMEDY_PLOTLINES = [];
let ROMANCE_PLOTLINES = [];

MYSTERY_PLOTLINES.push("The story is about a barbarian in possession of stolen technology. It starts in a large city in South America. The effect of globalization on culture plays a major role in this story.");
MYSTERY_PLOTLINES.push("The story begins at a business meeting where a secret recording has been made by your main character. It's a story about a life or death decision and your character is not afraid to get involved.");
MYSTERY_PLOTLINES.push("Your main character is a woman in her late thirties, who is very reckless. The story begins on a mountain top. Your character sees something she wasn't meant to see.");
COMEDY_PLOTLINES.push("A bohemian prophet, an insignificant cinematographer, and a conservative patient get completely trashed in a football stadium, chaos ensues.");
COMEDY_PLOTLINES.push("This is a story of a washed-up super hero, who overcomes a fear of flying when zombies attack Wall Street.");
COMEDY_PLOTLINES.push("This is a fish-out-of-water story with a focus on wandering. The story is about an unambitious alchemist and takes place in a magical part of our universe.");
ROMANCE_PLOTLINES.push("This story is about a traveler who is in love with a wily smuggler. It takes place in a small city on a war-torn planet. The future of peacemaking is a major part of this story.");
ROMANCE_PLOTLINES.push("This is an epic about the need of intimacy versus the need for independence. The story begins with someone moving to a new dwelling, climaxes with the discovery of a long-lost friend, and ends with a journey.");
ROMANCE_PLOTLINES.push("This is a dark romance with a focus on the need for change and growth. The story is about a librarian who was once married to a bitter talk show host. The story starts with the revelation of a secret that puts lives at risk.");

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

  function welcome(assistant) {
    let welcomeIdx = Math.floor((Math.random() * Welcomes.length));
    console.log('Random number for the welcome is' + welcomeIdx);

    //  If Brian is confused and invites you in, set context appropriately
    if (welcomeIdx == 0) {
      console.log('hey, it\'s the beginning');
      assistant.setContext('confused_welcome');
    } else {
      assistant.setContext('successfully_welcomed');
    }
    assistant.ask(Welcomes[welcomeIdx]);
  }

  function correctWelcome(assistant) {
    assistant.setContext('successfully_welcomed');
    assistant.ask(SECONDARY_WELCOME);
  }

  function rhymeResponse(assistant){
   // assistant.tell("I'm so cool, I rhyme all the time");
      var word = assistant.getArgument("word_to_rhyme");
      console.log(word);
      poetry.rhyme(word, function(e){
        if(e.length == 0){
          assistant.ask('<speak>Are you trying to be funny? Because nothing rhymes with '+ word+ '.<break time="3s" />  NOTHING!</speak>');
        } else if(e.length == 1) {
          assistant.ask("there's only one word that rhymes with "+word + ". and that is " + e);
        }
        assistant.ask("There are a bunch of words that rhyme with " + word + " like " + e);
      });
  }

  //  Figure out which type of block the writer's suffering
  function identifyType(assistant) {
    //  See if we need a rhyme or general inspiration
    if (assistant.getArgument('block_type') == 'rhyme') {
      assistant.setContext('seeking_rhymes');
      assistant.ask('Dude, you just need a push in the right direction for a rhyme! Just let me know what word you\'re trying to rhyme');
    } else if (assistant.getArgument('block_type') == 'general') {
      // assistant.setContext('getting_genre');
      assistant.setContext('seeking_genre');
      assistant.ask('Hey, I feel you. I was having trouble with my meta fiction piece last night. Why don\'t I throw out a single plot line for you to play around with? What kind of genre are you writing?');
    }
  }

  //  Return a plot line
  function getPlotLine(assistant) {
    let genre = assistant.getArgument('genre');
    let rand = Math.floor((Math.random() * 3)); // random number between 0 and 2
    let plotLine = "";
    let genreNum = 0;
    console.log("*****************************GETPLOTLINE");
    console.log("Genre is " + genre);
    if (genre === "mystery") {
      genreNum = 0;
    } else if (genre === "comedy") {
      genreNum = 1;
    } else if (genre === "romance") {
      genreNum = 2;
    }
    switch (genreNum) {
      case 0:
        assistant.ask("Just try writing a page with this: "  + MYSTERY_PLOTLINES[rand]);
        break;
      case 1:
        assistant.ask("Just try writing a page with this: "  + COMEDY_PLOTLINES[rand]);
        break;
      case 2:
        assistant.ask("Just try writing a page with this: "  + ROMANCE_PLOTLINES[rand]);
        break;
      default:
        break;
    }
  }

  // function testResponse(assistant) {
  //   assistant.tell('I\'m trying to get some sweet rhymes for you, and I\'m totally on the backend.');
  // }

  let actionMap = new Map();
  // actionMap.set(TEST_ACTION, testResponse);
  actionMap.set(WELCOME_ACTION, welcome);
  actionMap.set(RHYME_ACTION, rhymeResponse);
  actionMap.set(PARSE_ACTION, identifyType);
  actionMap.set(CORRECT_WELCOME_ACTION, correctWelcome);
  actionMap.set(GET_PLOT_ACTION, getPlotLine);

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
