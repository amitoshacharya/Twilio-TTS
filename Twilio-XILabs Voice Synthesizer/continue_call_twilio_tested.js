/*
This is a Twilio Function that is used to continue the call after the user input is received.
This Function uses Open AI module to generate responses.
*/

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

    //Configuration code for OpenAI
    const openaiOBJ = new OpenAIApi({ apiKey: context.OPENAI_API_KEY });

    //Fetching User Input
    const user_input = event.SpeechResult;

    console.log(`User Speech Input: ${user_input}`);   
    const messages = [{
            "role": "system",
            "content": "You are an AI assistant that helps people to respond the query under 50 words."
            }];

    // AI Assistant Voice: "Please wait, let me check and get back to you."
    // // Un-comment below twiml.play using xilabs.ask method when pre-recording
    // twiml.play(await xiLabs.ask(CONTAINER_NAME, CONNECTION_STRING, xi_api_key, voice_id, "Please wait, let me check and get back to you.", "_Immediate_Response_To_User_Input"));
    twiml.play("https://fetchscepoc.blob.core.windows.net/twilio-test/xi-labs-audio_Immediate_Response_To_User_Input.mp3");
    twiml.pause({length: 1});

    if (user_input) {
        messages.push({
            "role": "user", 
            "content": user_input
        });
        
        const txt = await generate_chat_response(openaiOBJ, messages);
        messages.push({"role": "assistant", "content": txt});
        
        console.log(`Chat Response: ${txt}`);

        // AI Assistant Voice: Response to user_input in ElevenLabs Voice
        // twiml.say(txt);
        twiml.play(await xiLabs.ask(CONTAINER_NAME, CONNECTION_STRING, xi_api_key, voice_id, txt, "Response_To_Query"));
    };
    
    const gather = twiml.gather({
            input:'speech',
            action:'/continue_call_twilio_tested',
            timeout: 3,
            speechTimeout: "auto"
        });

    // AI Assistant Voice: "What else do you want to know?"
    // gather.say("What else do you want to know?");
    // // Un-comment below twiml.play using xilabs.ask method when pre-recording
    // gather.play(await xiLabs.ask(CONTAINER_NAME, CONNECTION_STRING, xi_api_key, voice_id, "What else do you want to know?", "_Check_Next_Query"));
    gather.pause({length: 1});
    gather.play("https://fetchscepoc.blob.core.windows.net/twilio-test/xi-labs-audio_Check_Next_Query.mp3");

    // AI Assistant Voice: "Thank you for contacting!"
    twiml.play("https://fetchscepoc.blob.core.windows.net/twilio-test/xi-labs-audio_Call_Exiting.mp3");
    return callback(null, twiml);
};