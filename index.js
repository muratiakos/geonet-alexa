/* eslint-disable  func-names */
/* eslint-disable  no-console */

const Alexa = require('ask-sdk');
const http = require('http');
const https = require("https");

const DEBUG = 0;

function d(msg) {
  if (DEBUG) console.log(msg);
}
function SpeechCard(handlerInput, speechOutput) {
  return handlerInput.responseBuilder
      .speak(speechOutput)
      .withSimpleCard(SKILL_NAME, speechOutput)
      .getResponse();
}

const httpGet = url => {
  return new Promise((resolve, reject) => {
      var client = http;
      if (url.match(/^https/g)) client = https;

      client.get(url, res => {
      res.setEncoding('utf8');
      let body = ''; 
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve(body));
      }).on('error', reject);
  });
};

async function getVolcano() {
  return 'http://api.geonet.org.nz/volcano/1';
}

async function GetQuakeData(mmi=3) {
  const responseStr = await httpGet(`http://api.geonet.org.nz/quake?MMI=${mmi}`);
  d(`Received response:\n${responseStr}`);
  const response = JSON.parse(responseStr);
  return response["features"];
}
async function GetRecentQuakeData(mmi=3, location) {
  const quakes = await GetQuakeData(mmi);
  //TODO: pick-up device location ["locality"]
  return quakes[0]["properties"];
}

function CalucalteTimeDifference(time) {
  var currentMiliseconds = Date.now(); 
  var oneDate = new Date(time);
  var oneDateMiliseconds = oneDate.getTime();
  var difference = currentMiliseconds-oneDateMiliseconds;
  return diff = new Date(difference);
}

function ConvertTimeToSpeech(time) {
  return `${CalucalteTimeDifference(time).getHours()} hours ago`;
}

function ConvertQuakeToSpeech(quake) {
  var ago = ConvertTimeToSpeech(quake["time"]);
  return `${ago} at ${quake["locality"]} with a magnitude of ${Math.round(quake["magnitude"]*100)/100}`;
}

async function GetLatestNews() {
  const responseStr = await httpGet(`https://api.geonet.org.nz/news/geonet`);
  const response = JSON.parse(responseStr);
  var news = await httpGet(response.feed[0].link);
  //TODO: apply a proper innerHTML parser
  news = news.replace(/(\w|-)+=(\\)*("|')[^"^']*("|')/gm,'');
  news = news.replace(/(&nbps;|\n)/gm,' ');

  //Cut to header and footer
  news = news.replace(/<!.*<h3>/gm,'');
  news = news.replace(/Data&nbsp;Policy.*/gm,'');
  // Clean other tags
  news = news.replace(/<(!|\/)*(\w+\s*\w*\/*)>/gm,' ');
  
  return news;
}


// ----- TELL THE LATEST ONE ----
const LatestQuakeIntentHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'LaunchRequest' || (request.type === 'IntentRequest'
        && request.intent.name === 'LatestQuakeIntent');
  },
  async handle(handlerInput) {
    var speechOutput='There wasn\`t any recent earthquakes.';
    const quake = await GetRecentQuakeData();
    if (quake != null) {
      speechOutput=`The last relevant earthquake was ${ConvertQuakeToSpeech(quake)}`;
    }
    return SpeechCard(handlerInput,speechOutput);
  }
};


// ----- WAS THAT ONE ----
const WasThatAQuakeIntentHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'LaunchRequest' || (request.type === 'IntentRequest'
        && request.intent.name === 'WasThatAQuakeIntent');
  },
  async handle(handlerInput) {
    var speechOutput='No, I don\'t think so. There wasn\`t any recent earthquakes.';
    //TODO: no, don't worry
    //TODO: check time less that 0h, 10mins?
    //TODO: YES, there was one few hours ago
    return SpeechCard(handlerInput,speechOutput);
  }
};


// ----- READ NEWS ----
const ReadNewsIntentHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'LaunchRequest' || (request.type === 'IntentRequest'
        && request.intent.name === 'ReadNewsIntent');
  },
  async handle(handlerInput) {
    var speechOutput=await GetLatestNews();
    return SpeechCard(handlerInput,speechOutput);
  }
};

// ----- REPORT ONE ----
const FeltIntentHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'LaunchRequest' || (request.type === 'IntentRequest'
        && request.intent.name === 'FeltIntent');
  },
  async handle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    var size = request.intent.slots.size.value;
    var city = "Wellington"; //TODO: detect nearest city
    var speechOutput=`Ok, I am reporting a ${size} earthquake for ${city}.`;
    return SpeechCard(handlerInput,speechOutput);
  }
};

const HelpHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak(HELP_MESSAGE)
      .reprompt(HELP_REPROMPT)
      .getResponse();
  },
};

const ExitHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && (request.intent.name === 'AMAZON.CancelIntent'
        || request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak(STOP_MESSAGE)
      .getResponse();
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);

    return handlerInput.responseBuilder.getResponse();
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);

    return handlerInput.responseBuilder
      .speak('Sorry, an error occurred.')
      .reprompt('Sorry, an error occurred.')
      .getResponse();
  },
};

const SKILL_NAME = 'GeoNet assistant';
const HELP_MESSAGE = 'You can say - if that was an earthquake or when was the last earthquake';
const HELP_REPROMPT = 'What do you want to know from GeoNet?';
const STOP_MESSAGE = 'Goodbye!';

const skillBuilder = Alexa.SkillBuilders.standard();

exports.handler = skillBuilder
  .addRequestHandlers(
    LatestQuakeIntentHandler,
    WasThatAQuakeIntentHandler,
    FeltIntentHandler,
    ReadNewsIntentHandler,
    HelpHandler,
    ExitHandler,
    SessionEndedRequestHandler
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();
