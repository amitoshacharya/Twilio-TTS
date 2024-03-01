const OpenAIApi = require("openai");

async function generate_chat_response(openaiOBJ, conversation_history){
    /*
    This function is generating chat responses using OpenAI Chat Completion API.
    */
    const chat_completion = await openaiOBJ.chat.completions.create({
        messages: conversation_history,
        model: "gpt-3.5-turbo",
        max_tokens:100,
        top_p:1,
        frequency_penalty:0,
        presence_penalty:0,
        temperature:0.7
    });

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
    const azureBlobPath = Runtime.getFunctions()['upload_stream_cloud'].path; 
    const azureBolb = require(azureBlobPath);

    
    //Configuration code for OpenAI
    const openaiOBJ = new OpenAIApi({ apiKey: context.OPENAI_API_KEY });

    //Fetching User Input
    const user_input = event.SpeechResult;
        
    // const ai_verify = "Did you say, ";
    // twiml.say(ai_verify.concat(user_input));
    // twiml.play(await xiLabs.ask(xi_api_key, voice_id, ai_verify.concat(user_input), ++counter));
    const messages = [{
            "role": "system",
            "content": "You are an AI assistant that helps people to respond all query under 50 words."
            }];

    // twiml.play(await xiLabs.ask(CONTAINER_NAME, CONNECTION_STRING, xi_api_key, voice_id, "Please wait, let me check and get back to you.", "_Immediate_Response_To_User_Input"));
    twiml.play("https://fetchscepoc.blob.core.windows.net/twilio-test/xi-labs-audio_Immediate_Response_To_User_Input.mp3");
    twiml.pause({length: 1});

    if (user_input) {
        messages.push({
            "role": "user", 
            "content": user_input
        });
        
        const chat_response = await generate_chat_response(openaiOBJ, messages);
        messages.push({"role": "assistant", "content": chat_response});
        
        console.log(chat_response);
        // twiml.say(chat_response);
        const xiLabs_voices = await xiLabs.stream(xi_api_key, voice_id, chat_response);
        // twiml.play(await xiLabs.ask(CONTAINER_NAME, CONNECTION_STRING, xi_api_key, voice_id, txt, "Response_To_Query"));

        console.log('we got eleven labs audio', xiLabs_voices);
        
        const blob_urls = await azureBolb.upload(CONTAINER_NAME, CONNECTION_STRING, xiLabs_voices, "Response_To_Query");

        console.log('we uploaded eleven labs audio to azure at', blob_urls);
        for (const url of blob_urls){
            if (url){
                console.log(url);
                twiml.play(url);
            }            
            
            // twiml.pause({length:0.5});
        }
    };
    
    const gather = twiml.gather({
            input:'speech',
            action:'/continue_call_twilio_tested',
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