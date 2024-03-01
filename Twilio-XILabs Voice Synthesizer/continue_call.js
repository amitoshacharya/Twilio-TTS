/*
This is a Twilio Function that is used to continue the call after the user input is received.
This Function uses Azure-Open AI module to generate responses.
*/
const { OpenAIClient, AzureKeyCredential } = require("@azure/openai");

async function generate_chat_response(openaiOBJ, deployment, conversation_history){
    /*
    This function is generating chat responses using OpenAI Chat Completion API.
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

exports.handler = async function(context, event, callback) {
	const twiml = new Twilio.twiml.VoiceResponse();
    
    //Configuration code for ElevenLabs 
    const xi_api_key = context.ELEVEN_LABS_API_KEY;
    const voice_id = context.VOICE_ID;  // voice of Grace - southern american 
    const xiLabsPath = Runtime.getFunctions()['eleven_labs'].path; 
    const xiLabs = require(xiLabsPath);
    
    //Configuration code for Azure
    const CONTAINER_NAME= context.AZURE_BLOB_CONTAINER_NAME; 
    const CONNECTION_STRING = context.AZURE_STORAGE_CONNECTION_STRING;

    //Configuration code for Azure OpenAI
    const az_openai_api_key = new AzureKeyCredential(context.AZURE_OPENAI_API_KEY);
    const az_openai_endpoint = context.AZURE_OPENAI_ENDPOINT;
    const az_openai_deployment = context.AZURE_OPENAI_DEPLOYMENT;
    const azureopenaiOBJ = new OpenAIClient(az_openai_endpoint, az_openai_api_key);

    //Fetching User Input
    const user_input = event.SpeechResult;

    console.log(`User Speech Input: ${user_input}`);   
    // const ai_verify = "Did you say, ";
    // twiml.say(ai_verify.concat(user_input));
    // twiml.play(await xiLabs.ask(xi_api_key, voice_id, ai_verify.concat(user_input), ++counter));
    const messages = [{
            "role": "system",
            "content": "You are an AI assistant that helps people to respond the query under 50 words."
            }];

    // twiml.play(await xiLabs.ask(CONTAINER_NAME, CONNECTION_STRING, xi_api_key, voice_id, "Please wait, let me check and get back to you.", "_Immediate_Response_To_User_Input"));
    twiml.play("https://fetchscepoc.blob.core.windows.net/twilio-test/xi-labs-audio_Immediate_Response_To_User_Input.mp3");
    twiml.pause({length: 1});

    if (user_input) {
        messages.push({
            "role": "user", 
            "content": user_input
        });
        
        const txt = await generate_chat_response(azureopenaiOBJ, az_openai_deployment, messages);
        messages.push({"role": "assistant", "content": txt});
        
        console.log(`Chat Response: ${txt}`);
        // twiml.say(txt);
        twiml.play(await xiLabs.ask(CONTAINER_NAME, CONNECTION_STRING, xi_api_key, voice_id, txt, "Response_To_Query"));
    };
    
    const gather = twiml.gather({
            input:'speech',
            action:'/continue_call',
            timeout: 3,
            speechTimeout: "auto"
        });
    // gather.say("What else do you want to know?");
    // gather.play(await xiLabs.ask(CONTAINER_NAME, CONNECTION_STRING, xi_api_key, voice_id, "What else do you want to know?", "_Check_Next_Query"));
    gather.pause({length: 1});
    gather.play("https://fetchscepoc.blob.core.windows.net/twilio-test/xi-labs-audio_Check_Next_Query.mp3");


    twiml.play("https://fetchscepoc.blob.core.windows.net/twilio-test/xi-labs-audio_Call_Exiting.mp3");
    return callback(null, twiml);
};