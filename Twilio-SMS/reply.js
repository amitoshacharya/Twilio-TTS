/*
This module is intended to provide OpenAI responses for user sms query.
*/

const OpenAIApi = require("openai");

async function generate_chat_response(openaiOBJ, conversation_history){
    const chat_completion = await openaiOBJ.chat.completions.create({
        messages: conversation_history,
        model: "gpt-3.5-turbo",
        max_tokens:200,
        top_p:1,
        frequency_penalty:0,
        presence_penalty:0,
        temperature:0.7
    });

    return chat_completion.choices[0].message.content;
}

exports.reply = async function(openAI_key, incomingMessage) {
  const openaiOBJ = new OpenAIApi({ apiKey: openAI_key}); //openai instance

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

      result = await generate_chat_response(openaiOBJ, messages);
      messages.push({"role": "assistant", "content": result});
      console.log("Answer : ",result);
      // twiml.message(result);
    } 
    else {result = 'Not sure what you meant! What do you want to know?';}
  }
  return result;
};