/*
This module is intended to provide Azure-OpenAI responses for user sms query.
*/

const { OpenAIClient, AzureKeyCredential } = require("@azure/openai");

async function generate_chat_response(openaiOBJ, deployment, conversation_history){
    /*
    This function is generating chat responses using Azure-OpenAI Chat Completion API.
    */
    const config_options = {
        maxTokens:100,
        topP:1,
        presencePenalty:0,
        frequencyPenalty:0,
        temperature:0.7
    };
    const chat_completion = await openaiOBJ.getChatCompletions(deployment, conversation_history, config_options);

    return chat_completion.choices[0].message.content;
}

exports.reply = async function(az_openai_api_key, az_openai_endpoint, az_openai_deployment, incomingMessage) {
  //openai instance
  const azureopenaiOBJ = new OpenAIClient(az_openai_endpoint, new AzureKeyCredential(az_openai_api_key));

  const messages = [{
        "role": "system",
        "content": "You are an AI assistant that helps people and please respond under 50 words."
        }];

	if (incomingMessage.includes('hello')) {
    result = 'Hello, there!';
  } else if (incomingMessage.includes('bye')) {
    result = 'Goodbye!';
  } else {
    if (incomingMessage){
      messages.push({
            "role": "user", 
            "content": incomingMessage
        });

      result = await generate_chat_response(azureopenaiOBJ, az_openai_deployment, messages);
      messages.push({"role": "assistant", "content": result});
      console.log("Answer : ",result);
      // twiml.message(result);
    } 
    else {result = 'Not sure what you meant! What do you want to know?';}
  }
  return result;
};