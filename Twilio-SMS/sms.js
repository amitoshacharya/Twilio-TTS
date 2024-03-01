/*
The following module is intended to perform as an entry-point for Twilio.
*/

exports.handler = async function(context, event, callback){
    // Create a new messaging response object
    const twiml = new Twilio.twiml.MessagingResponse();
  
    // Access the incoming text content from `event.Body`
    const incomingMessage = event.Body.toLowerCase();
  
    // OpenAI
    // // Configuration code for OpenAI
    // const open_api_key = context.OPENAI_API_KEY
    // const openaiPath = Runtime.getFunctions()['reply'].path; 
    // const chatGPT = require(openaiPath);
    // const respond_message = await chatGPT.reply(open_api_key, incomingMessage);
    
    // Azure OpenAI
    // Configuration code for Azure OpenAI
    const az_openai_api_key = context.AZURE_OPENAI_API_KEY;
    const az_openai_endpoint = context.AZURE_OPENAI_ENDPOINT;
    const az_openai_deployment = context.AZURE_OPENAI_DEPLOYMENT;
    const az_openaiPath = Runtime.getFunctions()['reply_azure'].path; 
    const az_chatGPT = require(az_openaiPath);
    const respond_message = await az_chatGPT.reply(az_openai_api_key, az_openai_endpoint, az_openai_deployment, incomingMessage); 
    
    const toNum = event.To;
    const fromNum = event.From;
  
    twiml.message({
      to: `${fromNum}`,
      from: `${toNum}`
    },respond_message);
    
  
    // Return the TwiML as the second argument to `callback`
    // This will render the response as XML in reply to the webhook request
    return callback(null, twiml);
  };