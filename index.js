/* eslint-disable  func-names */
/* eslint-disable  no-console */

const Alexa = require('ask-sdk');
const http = require('http');

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
      http.get(url, res => {
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

function ConvertTimeToSpeech(time="November 02, 2017 06:00:00") {
  var currentMiliseconds = Date.now(); 
  var oneDate = new Date(time);
  var oneDateMiliseconds = oneDate.getTime();
  var difference = currentMiliseconds-oneDateMiliseconds;
  var diff = new Date(difference)

  return `${diff.getHours()} hours ago`;
}
function ConvertQuakeToSpeech(quake) {
  var ago = ConvertTimeToSpeech(quake["time"]);
  return `${ago} at ${quake["locality"]} with a magnitude of ${Math.round(quake["magnitude"]*100)/100}`;
}

const LatestQuakeIntentHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    d(`REQUEST: ${JSON.stringify(request)}`);
    d(`REQUEST type is: ${request.type}`);
    
    return request.type === 'LaunchRequest' || (request.type === 'IntentRequest'
        && request.intent.name === 'LatestQuakeIntent');
  },
  async handle(handlerInput) {
    var speechOutput='There wasn\`t any recent quakes.';

    const quake = await GetRecentQuakeData();
    if (quake != null) {
      speechOutput=`The last relevant quake was ${ConvertQuakeToSpeech(quake)}`;
    }
    return SpeechCard(handlerInput,speechOutput);
  }
};

const HelpHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.HelpIntent';
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
const GET_FACT_MESSAGE = 'Here\'s your fact: ';
const HELP_MESSAGE = 'You can say - if that was an earthquake.';
const HELP_REPROMPT = 'What do you want to know from GeoNet?';
const STOP_MESSAGE = 'Goodbye!';

const data = [
  'GeoNet fact'
];

const skillBuilder = Alexa.SkillBuilders.standard();

exports.handler = skillBuilder
  .addRequestHandlers(
    LatestQuakeIntentHandler,
    HelpHandler,
    ExitHandler,
    SessionEndedRequestHandler
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();
