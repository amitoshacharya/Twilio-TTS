/*
The following module is intended to perform an entry-point for Twilio
*/

exports.handler = async function(context, event, callback) {
    const twiml = new Twilio.twiml.VoiceResponse();
    /*
    //Un-comment below configuration code when executing ElevenLabs when pre-recording

    const xi_api_key = context.ELEVEN_LABS_API_KEY;
    const voice_id = context.VOICE_ID;  // voice of Grace - southern american
    const xiLabsPath = Runtime.getFunctions()['eleven_labs'].path; 
    const xiLabs = require(xiLabsPath);
    
    //Un-comment below configuration code when executing Azure when pre-recording

    const CONTAINER_NAME= context.AZURE_BLOB_CONTAINER_NAME; 
    const CONNECTION_STRING = context.AZURE_STORAGE_CONNECTION_STRING;
    */
    
    // twiml.say("You are connected successfully!");
    
    // AI Assistant Voice: "Hi, How can I help you?"
    const gather = twiml.gather({
        input:'speech',
        action:'/continue_call',
        timeout: 3,
        speechTimeout: "auto"
        });
    // gather.say("What do you want to know?");
    // gather.play(await xiLabs.ask(CONTAINER_NAME, CONNECTION_STRING, xi_api_key, voice_id, "Hi, How can I help you?","_Initial_Greeting")); 
    gather.play("https://fetchscepoc.blob.core.windows.net/twilio-test/xi-labs-audio_Initial_Greeting.mp3");   


    // AI Assistant Voice: "Thank you for contacting!"
    // twiml.say("Thank you for contacting");
    // twiml.play(await xiLabs.ask(CONTAINER_NAME, CONNECTION_STRING, xi_api_key, voice_id, "Thank you for contacting!","_Call_Exiting"));
    twiml.play("https://fetchscepoc.blob.core.windows.net/twilio-test/xi-labs-audio_Call_Exiting.mp3");
    return callback(null, twiml);
};