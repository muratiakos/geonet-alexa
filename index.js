/* eslint-disable  func-names */
/* eslint-disable  no-console */

const Alexa = require('ask-sdk');
const http = require('http');

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

//
function GetFirstGeonetData(location) {

}

const LatestQuakeIntentHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    console.log(`REQUEST: ${JSON.stringify(request)}`);
    console.log(`REQUEST type is: ${request.type}`);
    
    return request.type === 'LaunchRequest' || (request.type === 'IntentRequest'
        && request.intent.name === 'LatestQuakeIntent');
  },
  async handle(handlerInput) {
    /*
    const factArr = data;
    const factIndex = Math.floor(Math.random() * factArr.length);
    const randomFact = factArr[factIndex];
    const speechOutput = GET_FACT_MESSAGE + randomFact;
    */

    // Start API block
    var responseString = '';
    var speechOutput='Not populated';
    console.log('This is before API call');
    
    // http.get('http://api.geonet.org.nz/volcano/1', (res) => 
    /*http.get('http://api.geonet.org.nz/quake?MMI=3', (res) => {
        //console.log('statusCode:', res.statusCode);
        //console.log('headers:', res.headers);

        //Fetching data
        res.on('data', (d) => { responseString += d; });

        //Finished
        res.on('end', function(res) {
            //console.log('Response------------>', responseString);
            const eqobj=JSON.parse(responseString);
            speechOutput = eqobj["features"][0]["properties"]["locality"];
            //console.log('==> API response: ', speechOutput);
            //console.log('What comes after this?')

            console.log(`After constructing the speechOutput=${speechOutput}`);
        });
    }).on('error', (e) => { console.error(e);});
    */

    const response = await httpGet('http://www.somesite.com');
    console.log(response);

    speechOutput=response;
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
