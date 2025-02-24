// Replace YOUR_TOKEN_HERE with your token value
// Please visit https://alexa.design/cookbook for additional examples on implementing slots, dialog management, session persistence, api calls, and more.
const Alexa = require('ask-sdk-core');
const axios = require('axios');
const unscape = require('unescape');
const TOKEN = 'YOUR_TOKEN_HERE'

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    async handle(handlerInput) {
        try {
            const response = await axios.get(`https://uni001eu5.fusionsolar.huawei.com/rest/pvms/web/kiosk/v1/station-kiosk-file?kk=${TOKEN}`);
            // console.log('~~~~ Respuesta API:', unscape(response.data.data));
            const data = JSON.parse(unscape(response.data.data));
            const power = Math.round(data.realKpi.realTimePower * 10) / 10;
            let speechText = `La potencia actual es de ${power}.`;
            
            switch (true) {
                case (power <= 0.5):
                    speechText = `La potencia actual es muy baja, de solo ${power} kilovatios.`;
                    break;
                case (power > 0.5 && power <= 1):
                    speechText = `La potencia actual es baja, de solo ${power} kilovatios.`;
                    break;
                case (power > 1 && power <= 2):
                    speechText = `La potencia actual es media, de ${power} kilovatios.`;
                    break;
                case (power > 2 && power <= 3):
                    speechText = `La potencia actual es alta, de ${power} kilovatios.`;
                    break;
                case (power > 3):
                    speechText = `La potencia actual es muy alta, de ${power} kilovatios. ¡Vamos a todo tren!`;
                    break;
                default:
                    speechText = `Valor desconocido`;
                    console.log("Valor no reconocido");
            }

            return handlerInput.responseBuilder
                .speak(speechText)
                .getResponse();
        } catch (error) {
            return handlerInput.responseBuilder
                .speak(`Lo siento, hubo algún error al leer los datos del inversor.`)
                .getResponse();
        }

        // const speakOutput = 'Hola, puedes preguntarme por la potencia actual diciendo, dame la potencia';

        // return handlerInput.responseBuilder
        //     .speak(speakOutput)
        //     .reprompt(speakOutput)
        //     .getResponse();
    }
};

const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'Puedes preguntarme directamente, dime la potencia';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speakOutput = 'Adios!';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};

/* *
 * FallbackIntent triggers when a customer says something that doesn’t map to any intents in your skill
 * It must also be defined in the language model (if the locale supports it)
 * This handler can be safely added but will be ingnored in locales that do not support it yet 
 * */
const FallbackIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.FallbackIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'Lo siento, no te he entendido. Prueba de nuevo.';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

/* *
 * SessionEndedRequest notifies that a session was ended. This handler will be triggered when a currently open 
 * session is closed for one of the following reasons: 
 * 1) The user says "exit" or "quit".
 * 2) The user does not respond or says something that does not match an intent defined in your voice model.
 * 3) An error occurs 
 * */
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        console.log(`~~~~ Session ended: ${JSON.stringify(handlerInput.requestEnvelope)}`);
        // Any cleanup logic goes here.
        return handlerInput.responseBuilder.getResponse(); // notice we send an empty response
    }
};

/* *
 * The intent reflector is used for interaction model testing and debugging.
 * It will simply repeat the intent the user said. You can create custom handlers for your intents 
 * by defining them above, then also adding them to the request handler chain below 
 * */
const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
        const speakOutput = `You just triggered ${intentName}`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};

/**
 * Generic error handling to capture any syntax or routing errors. If you receive an error
 * stating the request handler chain is not found, you have not implemented a handler for
 * the intent being invoked or included it in the skill builder below 
 * */
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        const speakOutput = 'Lo siento, ocurrió un error. Inténtalo de nuevo.';
        console.log(`~~~~ Error handled: ${JSON.stringify(error)}`);

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

/**
 * This handler acts as the entry point for your skill, routing all request and response
 * payloads to the handlers above. Make sure any new handlers or interceptors you've
 * defined are included below. The order matters - they're processed top to bottom 
 * */
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        FallbackIntentHandler,
        SessionEndedRequestHandler
    )
    .addErrorHandlers(
        ErrorHandler
    )
    .lambda();
