/*
The following module is intended to perform Text-To-Speech using ElevenLabs API.
*/

const ElevenLabs = require('elevenlabs-node');
const {BlobServiceClient} = require('@azure/storage-blob');

async function voice_synthesis(obj, input_speech, voice_id){
    /*
    This function is processing text-to-speech using ElevenLabs API.
    */
    console.log('Processing Eleven Labs..');
    const audio = await obj.textToSpeechStream({
        // Required Parameters
        textInput:       input_speech,                // The text you wish to convert to speech

        // Optional Parameters
        voiceId:         voice_id,         // A different Voice ID from the default
        stability:       0.5,                            // The stability for the converted speech
        similarityBoost: 0.5,                            // The similarity boost for the converted speech
        modelId:         "eleven_multilingual_v2",       // The ElevenLabs Model ID
        style:           1,                              // The style exaggeration for the converted speech
        responseType:    "stream",                       // The streaming type (arraybuffer, stream, json)
        speakerBoost:    true                            // The speaker boost for the converted speech
        });
    
    console.log('eleven labs voice generated');

    return audio;
}

async function uploadToAzureBlobStorage(audioStream, containerName, blobName, connectionString) {
    /*
    This function uploads the ElevenLabs Audio to Azure Storage.
    */
    console.log('Uploading in Cloud..');
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

// ElevenLabs helper function
exports.ask = async (CONTAINER_NAME, CONNECTION_STRING, ELEVEN_LABS_API_KEY, VOICE_ID, textInput, Append_File_Name) => {

    // ElevenLabs configure
    const xi_api_key = ELEVEN_LABS_API_KEY;
    const voice_id = VOICE_ID;
    const xi_labs_obj = new ElevenLabs(
        {
            apiKey: xi_api_key, // Your API key from Elevenlabs
            voiceId: voice_id,  // A Voice ID from Elevenlabs
        }
    );

    // Upload the audio stream to Azure Blob Storage
    const azureBlobContainer = CONTAINER_NAME;
    const azureConnectionString = CONNECTION_STRING;

    // Audio filename
    const audioFileName = `xi-labs-audio${Append_File_Name}.mp3`;

    // Synthesizing Voice from ElevenLabs
    const audioFile = await voice_synthesis(xi_labs_obj, textInput, voice_id);

    if (audioFile){
        // Upload the audio stream to a Azure
        const azureBlobUrl = await uploadToAzureBlobStorage(audioFile, azureBlobContainer, audioFileName, azureConnectionString);

        // return the Azure Blob Url
        return azureBlobUrl;
    }
};