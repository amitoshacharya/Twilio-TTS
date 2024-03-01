const ElevenLabs = require('elevenlabs-node');

function chunkText(text, chunkSize){
    const chunks = [];
    for (let i = 0; i < text.length; i += chunkSize){
        chunks.push(text.slice(i, i + chunkSize).join(' '));
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
            stability:       0.5,                            // The stability for the converted speech
            similarityBoost: 0.5,                            // The similarity boost for the converted speech
            modelId:         "eleven_multilingual_v2",       // The ElevenLabs Model ID
            style:           1,                              // The style exaggeration for the converted speech
            responseType:    "stream",                       // The streaming type (arraybuffer, stream, json)
            speakerBoost:    true                            // The speaker boost for the converted speech
            });
            // await delayAsync(200);
    return audioStream;
}

// ElevenLabs helper function
exports.stream = async (ELEVEN_LABS_API_KEY, ADAM_VOICE_ID, textInput) => {

    // ElevenLabs configure
    const xi_api_key = ELEVEN_LABS_API_KEY;
    const voice_id = ADAM_VOICE_ID;
    const xi_labs_obj = new ElevenLabs(
        {
            apiKey: xi_api_key, // Your API key from Elevenlabs
            voiceId: voice_id,  // A Voice ID from Elevenlabs
        }
    );

    // Synthesizing Voice from ElevenLabs
    // const audioFiles = await voice_synthesis(xi_labs_obj, textInput, voice_id);
    // console.log('audio files are returned');
    // // return audioFiles;

    const batchSize = 20;
    const speech_chunks = chunkText(textInput.split(' '), batchSize);

    const audioStreams = await Promise.all(speech_chunks.map(async (chunk)=> {
        try{
            if (chunk.trim()){

                await delayAsync(500);
                // Process chunk asynchronously
                console.log(`processing ...... ${chunk}`);
                const audioStream = await voice_synthesis(xi_labs_obj, chunk.trim(), voice_id);
                       
                console.log('upper chunk is processed');
                return audioStream;
            }
        } catch (error){
            console.error('Error processing chunk:', error);
            return null;
        }
    }));
    console.log('eleven labs processed');
    return audioStreams;
};