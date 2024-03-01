const OpenAIApi = require("openai");
const ElevenLabs = require('elevenlabs-node');
const {BlobServiceClient} = require('@azure/storage-blob');

function chunkText(text, chunkSize){
    const chunks = [];
    for (let i = 0; i < text.length-1; i += chunkSize){
        const chunk = text.slice(i, i + chunkSize).join(' ');
        if (chunk){
            console.log(chunk.trim('-'));
            chunks.push(chunk.trim('-').trim());
        }        
    }
    return chunks;
}

function delayAsync(ms){
    return new Promise (resolve => setTimeout(resolve, ms))
}

async function voice_synthesis(obj, input_speech, voice_id){
    /*
    This function is processing text-to-speech using ElevenLabs API.
    */
    // const batchSize = 1;
    // const speech_chunks = chunkText(input_speech.split('.'), batchSize);

    const audioStream = await obj.textToSpeechStream({
                // Required Parameters
            textInput:       input_speech,    // The text you wish to convert to speech

            // Optional Parameters
            voiceId:         voice_id,         // A different Voice ID from the default
            stability:       0.8,                            // The stability for the converted speech
            similarityBoost: 0.5,                            // The similarity boost for the converted speech
            modelId:         "eleven_multilingual_v2",       // The ElevenLabs Model ID
            style:           0.8,                              // The style exaggeration for the converted speech
            responseType:    "stream",                       // The streaming type (arraybuffer, stream, json)
            speakerBoost:    true                            // The speaker boost for the converted speech
            });
            // await delayAsync(200);
    return audioStream;
}

async function uploadToAzureBlobStorage(audioStream, containerName, blobName, connectionString) {
    /*
    This function uploads the ElevenLabs Audio to Azure Storage.
    */
    const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    const uploadOptions = {
        blobHTTPHeaders: { blobContentType: 'audio/mp3' }
    };

    try {
        // await blockBlobClient.uploadData(audioBuffer, audioBuffer.length, undefined, uploadOptions);
        await blockBlobClient.uploadStream(audioStream, undefined, undefined, uploadOptions);
        console.log('Blob pushed to Azure Blob Storage');
    } catch (error) {
        console.log('Error in Uploading Stream in Azure Blob');
        throw error;
    }

    return blockBlobClient.url;
    
}

async function eleven_azure_integration(AZURE_CONTAINER_NAME, AZURE_CONNECTION_STRING, AZURE_BLOB_NAME, ELEVEN_LABS_API_KEY, ELEVEN_VOICE_ID, textInput){

    // ElevenLabs voice synthesizing
    const xi_labs_obj = new ElevenLabs(
        {
            apiKey: ELEVEN_LABS_API_KEY, // Your API key from Elevenlabs
            voiceId: ELEVEN_VOICE_ID,  // A Voice ID from Elevenlabs
        }
    );
    const audioStream = await voice_synthesis(xi_labs_obj, textInput, ELEVEN_VOICE_ID);
    console.log('we got eleven labs audio for ', AZURE_BLOB_NAME);
    // Uploading files to Azure
    const url = await uploadToAzureBlobStorage(audioStream, AZURE_CONTAINER_NAME, AZURE_BLOB_NAME, AZURE_CONNECTION_STRING);

    return url;
    
}

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
    const voice_id = context.VOICE_ID;  
    // const xiLabsPath = Runtime.getFunctions()['eleven_labs'].path; 
    // const xiLabs = require(xiLabsPath);

    
    //Configuration code for Azure
    const CONTAINER_NAME= context.AZURE_BLOB_CONTAINER_NAME; 
    const CONNECTION_STRING = context.AZURE_STORAGE_CONNECTION_STRING;
    // const azureBlobPath = Runtime.getFunctions()['upload_stream_cloud'].path; 
    // const azureBolb = require(azureBlobPath);

    
    //Configuration code for OpenAI
    const openaiOBJ = new OpenAIApi({ apiKey: context.OPENAI_API_KEY });

    //Fetching User Input
    const user_input = event.SpeechResult;
    console.log(user_input);
        
    // const ai_verify = "Did you say, ";
    // twiml.say(ai_verify.concat(user_input));
    // twiml.play(await xiLabs.ask(xi_api_key, voice_id, ai_verify.concat(user_input), ++counter));
    const messages = [{
            "role": "system",
            "content": "You are an AI assistant that helps people to respond all query in bullet points of sentences stricly under 10 words which will sum up to 50 words."
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
        
        // const xiLabs_voices = await xiLabs.stream(xi_api_key, voice_id, chat_response);

        // console.log('we got eleven labs audio', xiLabs_voices);
        
        // const blob_urls = await azureBolb.upload(CONTAINER_NAME, CONNECTION_STRING, xiLabs_voices, "Response_To_Query");
        const input_speech = chat_response.split(/[.\n]/);
        console.log(input_speech);
        
        const chunkSize = 1;
        const textChunks = chunkText(input_speech, chunkSize);
        console.log(textChunks);
        // return callback(null, twiml);
        const audioUrls = await Promise.allSettled(textChunks.map(async (chunk, index) => {
            try{
                if (chunk){
                    console.log(`processing ....${chunk}`);
                    const AZURE_BLOB_NAME = `Response_To_Query-${index+1}`;
                    const url = await eleven_azure_integration(CONTAINER_NAME, CONNECTION_STRING, AZURE_BLOB_NAME, xi_api_key, voice_id, chunk)
                    console.log('we uploaded eleven labs audio to azure at', url);
                    return url;
                }     
            }
            catch (error){
                console.error("Error in processing chunk --- ", error);
                return null;
            }
        }));

        // Extract URLs from settled promises
        // filter successful promises with valid URLs
        // extract URLs from fulfilled promises
        const blob_urls = audioUrls.filter(result => result.status === "fulfilled" && result.value).map(result => result.value);

        console.log(`we got urls to blob ::::  ${blob_urls}`);
        
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
            action:'/continue_call_testing',
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